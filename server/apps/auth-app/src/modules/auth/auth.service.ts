import {
    Injectable,
    UnauthorizedException,
    ConflictException, InternalServerErrorException, BadRequestException,
} from '@nestjs/common';
import {
    VerifyOtpDto,
    SendOtpDto,
    UserDto,
    ForgetPasswordDto,
    ResetPasswordDto,
    ChangeEmailRequestDto, ChangeEmailDto
} from './DTO/register.dto';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { LoginDto } from './DTO/login.dto';
import { JwtService } from '@app/common/jwt/jwt.service';
import { EmailService } from '@app/common';
import { generateOTP } from '@app/common';
import { PASSWORD_SALT_ROUNDS, CustomLoggerService } from '@app/common';
import {
    otpTemplate,
    passwordResetTemplate,
    verifyChangeEmailTemplate,
    changeEmailRequestTemplate,
    emailChangedSuccessTemplate
} from '@app/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import crypto from 'crypto';
import type { User } from '@prisma/client';
import { RedisService } from '@app/redis';

@Injectable()
export class AuthService {
    private readonly logger: CustomLoggerService;

    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly redisService: RedisService,
    ) {
        this.logger = new CustomLoggerService();
        this.logger.setContext(AuthService.name);
    }

    async forgetPassword(dto: ForgetPasswordDto) {
        this.logger.log(`Password reset requested for email: ${dto.email}`);

        const user = await this.prisma.user.findUnique({
            where: {email: dto.email},
            select: {id: true, name: true, email: true, username: true},
        });

        if (user) {
            const token = randomBytes(32).toString('hex'); // 64 characters

            // const hashedToken = await bcrypt.hash(token, PASSWORD_SALT_ROUNDS);
            // Create Hash to store in DB
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            // Use environment variable for frontend URL
            const frontendUrl = process.env.ENV === 'production'
                ? process.env.FRONTEND_URL
                : process.env.FRONTEND_URL_DEV || 'http://localhost:5173';
            const resetLink = `${frontendUrl}/forget-password?token=${token}`;

            // await this.emailService.sendEmail(user.email, 'Trackd - Password Reset', `Hello <strong> ${user.name} </strong>, <br/> <br/> Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 15 minutes.`);
            await this.emailService.sendEmail(user.email, "Password Reset - Trackd", passwordResetTemplate(user.name, resetLink));

            const res = await this.prisma.passwordResetToken.create({
                data: {
                    user: {
                        connect: {id: user.id},
                    },
                    token: hashedToken,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 mins
                },
            });

            if (!res) {
                this.logger.error(`Failed to create password reset token for user: ${user.id}`);
                throw new InternalServerErrorException("Failed to create password reset token");
            }

            this.logger.log(`Password reset email sent successfully to: ${dto.email}`);
        } else {
            this.logger.warn(`Password reset requested for non-existent email: ${dto.email}`);
        }

        return {message: 'Password reset link sent'};
    }

    async resetPassword(dto: ResetPasswordDto) {
        this.logger.log('Password reset attempt initiated');

        const hash = crypto
            .createHash('sha256')
            .update(dto.token)
            .digest('hex');

        const token = await this.prisma.passwordResetToken.findUnique({
            where: {token: hash},
            include: {user: true},
        });

        if (!token || token.expiresAt < new Date()) {
            this.logger.warn('Password reset attempted with invalid or expired token');
            throw new BadRequestException('Invalid or expired password reset token');
        }

        const newHashedPassword = await bcrypt.hash(dto.newPassword, PASSWORD_SALT_ROUNDS);

        await this.prisma.user.update({
            where: {id: token.user.id},
            data: {password: newHashedPassword, refreshTokens: []},
        });

        // Delete the used password reset token
        await this.prisma.passwordResetToken.delete({
            where: {id: token.id},
        });

        this.logger.log(`Password reset successful for user: ${token.user.id}`);
        return {message: 'Password has been reset successfully'};
    }

    async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string, user: object }> {
        this.logger.log(`Login attempt for email: ${dto.email}`);

        // verify user from DB
        const user = await this.prisma.user.findUnique({
            where: {email: dto.email},
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                username: true,
                createdAt: true,
                refreshTokens: true,
                avatar: true,
            }

        });

        if (!user) {
            this.logger.warn(`Login failed: User not found for email: ${dto.email}`);
            throw new UnauthorizedException('Invalid email');
        }

        if (user.password == null) {
            this.logger.warn(`Login failed: User ${user.id} has no password (OAuth account)`);
            throw new BadRequestException('Please Login with Google');
        }

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) {
            this.logger.warn(`Login failed: Invalid password for user: ${user.id}`);
            throw new UnauthorizedException('Invalid password');
        }

        const payload = {sub: user.id, email: user.email};

        const data = {
            accessToken: this.jwtService.sign(payload, 'access', {expiresIn: '15min'}),
            refreshToken: this.jwtService.sign(payload, 'refresh', {expiresIn: '7d'}),
        }

        const hashed = await bcrypt.hash(data.refreshToken, PASSWORD_SALT_ROUNDS);

        // Limit refresh tokens to max 5 (cleanup old tokens)
        let updatedTokens = [...user.refreshTokens];
        if (updatedTokens.length >= 5) {
            // Remove oldest tokens
            updatedTokens = updatedTokens.slice(-4); // Keep last 4
            this.logger.debug(`Cleaned up old refresh tokens for user: ${user.id}`);
        }
        updatedTokens.push(hashed);

        await this.prisma.user.update({
            where: {id: user.id},
            data: {refreshTokens: updatedTokens},
        });

        this.logger.log(`Login successful for user: ${user.id} (${user.email})`);

        return {
            ...data, user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                createdAt: user.createdAt,
                avatar: user.avatar,
            }
        };
    }

    async sendOtp(otpDto: SendOtpDto) {
        // Generate random 6-digit OTP
        const otp = generateOTP();

        this.logger.log(`Sending OTP to: ${otpDto.email}`);
        // await this.emailService.sendEmail(otpDto.email, 'Trackd - Email Verification Code', `Hello <strong> ${otpDto.name} </strong>, <br/> <br/> Your One Time Verification code is: <strong>${otp} </strong>. <br/> It is valid for 03 minutes.`);
        await this.emailService.sendEmail(
            otpDto.email,
            'Trackd - Email Verification Code',
            otpTemplate(otpDto.name, otp)
        );

        this.logger.debug(`OTP generated for ${otpDto.email}: ${otp}`);

        const payload = {
            email: otpDto.email,
            otp: await bcrypt.hash(otp, PASSWORD_SALT_ROUNDS),
        };
        return {otpToken: this.jwtService.sign(payload, 'otp')};
    }

    async register(dto: UserDto) {
        this.logger.log(`Registration attempt for email: ${dto.email}`);

        // save user to DB
        const existing = await this.prisma.user.findUnique({
            where: {email: dto.email},
            select: {id: true,},
        });

        if (existing) {
            this.logger.warn(`Registration failed: Email already in use: ${dto.email}`);
            throw new ConflictException('Email already in use');
        }

        const hashed = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

        // Create user first to get the ID
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashed,
            },
        });

        this.logger.log(`User registered successfully: ${user.id} (${user.email})`);

        const accessToken = this.jwtService.sign(
            {sub: user.id, email: user.email}, 'access',
            {expiresIn: '15min'},
        );
        const refreshToken = this.jwtService.sign(
            {sub: user.id, email: user.email}, 'refresh',
            {expiresIn: '7d'},
        );

        const hashedToken = await bcrypt.hash(refreshToken, PASSWORD_SALT_ROUNDS);

        // Update user with refresh token
        await this.prisma.user.update({
            where: {id: user.id},
            data: {refreshTokens: [hashedToken]},
        });

        return {
            accessToken, refreshToken, user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                createdAt: user.createdAt,
            }
        };
    }

    async logout(userId: string, refreshToken: string, accessToken?: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: {refreshTokens: true},
        });

        if (!user) return;

        // Blacklist the access token if provided
        if (accessToken) {
            try {
                await this.redisService.blacklistToken(accessToken);
                this.logger.debug(`Access token blacklisted for user ${userId}`);
            } catch (error) {
                this.logger.error('Failed to blacklist access token:', error);
            }
        }

        // Remove the specific refresh token
        const updatedTokens: string[] = [];
        for (const hashedToken of user.refreshTokens) {
            const matches = await bcrypt.compare(refreshToken, hashedToken);
            if (!matches) {
                updatedTokens.push(hashedToken);
            }
        }

        await this.prisma.user.update({
            where: {id: userId},
            data: {refreshTokens: updatedTokens},
        });
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        // verify OTP code (this is just a placeholder)
        const {payload, error} = this.jwtService.verify(
            verifyOtpDto.token, 'otp'
        ) as { error: boolean | object; payload: VerifyOtpDto };
        if (error) return false;

        return !!(payload.email === verifyOtpDto.email &&
            (await bcrypt.compare(verifyOtpDto.otp, payload.otp)));

    }

    async refreshToken(refreshToken: string) {
        const {payload, error} = this.jwtService.verify(
            refreshToken, 'refresh',
        ) as { error: boolean | object; payload: any };

        if (error) throw new UnauthorizedException('Invalid refresh token');

        // check if refresh token is in DB
        const user = await this.prisma.user.findUnique({
            where: {id: payload.sub},
            select: {
                id: true, name: true,
                email: true,
                avatar: true,
                username: true,
                createdAt: true,
                refreshTokens: true

            },
        });
        if (!user) throw new UnauthorizedException('User not found');

        // CRITICAL: Verify the refresh token exists in the database
        let tokenExists = false;
        for (const hashedToken of user.refreshTokens) {
            if (await bcrypt.compare(refreshToken, hashedToken)) {
                tokenExists = true;
                break;
            }
        }

        if (!tokenExists) {
            // SECURITY: Possible token reuse attack - invalidate all tokens
            this.logger.warn(`Token reuse detected for user ${user.id}. Invalidating all tokens.`);
            await this.prisma.user.update({
                where: {id: user.id},
                data: {refreshTokens: []},
            });
            throw new UnauthorizedException('Refresh token not found or has been revoked. All sessions invalidated.');
        }

        // Generate new tokens
        const accessToken = this.jwtService.sign(
            {sub: user.id, email: user.email}, 'access',
            {expiresIn: '15min'},
        );
        const newRefreshToken = this.jwtService.sign(
            {sub: user.id, email: user.email}, 'refresh',
            {expiresIn: '7d'},
        );

        // Update refresh tokens in DB (token rotation)
        const hashedNewToken = await bcrypt.hash(newRefreshToken, PASSWORD_SALT_ROUNDS);

        // Remove old refresh token and add new one
        const updatedTokens: string[] = [];
        for (const hashedToken of user.refreshTokens) {
            const matches = await bcrypt.compare(refreshToken, hashedToken);
            if (!matches) {
                updatedTokens.push(hashedToken);
            }
        }
        updatedTokens.push(hashedNewToken);

        await this.prisma.user.update({
            where: {id: user.id},
            data: {refreshTokens: updatedTokens},
        });


        return {
            accessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                createdAt: user.createdAt,
                avatar: user.avatar,
            }
        };
    }

    async changeEmailRequest(dto: ChangeEmailRequestDto, userId: string, email: string) {
        if (dto.newEmail == email) {
            throw new BadRequestException('New email cannot be the same as current email');
        }

        // Check if the new email is already in use by another user
        const emailInUse = await this.prisma.user.findUnique({
            where: {email: dto.newEmail},
            select: {id: true},
        });

        if (emailInUse) throw new ConflictException('Email already in use');

        // Get current user info to send notification to old email
        const currentUser = await this.prisma.user.findUnique({
            where: {id: userId},
            select: {name: true, email: true},
        });

        if (!currentUser) throw new BadRequestException('User not found');

        const token = randomBytes(32).toString('hex'); // 64 characters

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Use environment variable for frontend URL
        const frontendUrl = process.env.ENV === 'production'
            ? process.env.FRONTEND_URL
            : process.env.FRONTEND_URL_DEV || 'http://localhost:5173';
        const changeLink = `${frontendUrl}/change/email?token=${token}`;

        // Send notification to old email
        await this.emailService.sendEmail(currentUser.email, 'Trackd - Email Change Request', changeEmailRequestTemplate(currentUser.name, dto.newEmail));

        // Send verification link to new email
        await this.emailService.sendEmail(dto.newEmail, "Email Verification - Trackd", verifyChangeEmailTemplate(currentUser.name, changeLink));

        // create or update email change request per user
        const res = await this.prisma.emailChangeTable.upsert({
            where: {
                userId: userId,
            },
            update: {
                newEmail: dto.newEmail,
                token: hashedToken,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 mins
            },
            create: {
                userId: userId,
                newEmail: dto.newEmail,
                token: hashedToken,
                expiresAt: new Date(Date.now() + 1000 * 60 * 15),
            },
        });


        if (!res) throw new InternalServerErrorException("Failed to create email change request");

        return { message: 'Email change request sent successfully' };
    }

    async changeEmail(dto: ChangeEmailDto, isAuthenticated: boolean, userId: string) {
        const hashedToken = crypto
            .createHash('sha256')
            .update(dto.token)
            .digest('hex');

        // 1. Initial Check
        const token = await this.prisma.emailChangeTable.findUnique({
            where: {token: hashedToken}
        });

        if (!token) throw new BadRequestException('Invalid token');
        if (token.expiresAt < new Date(Date.now())) throw new BadRequestException("Token expired");

        let accessToken = null;
        let newRefreshToken = null;
        let usr = {};

        if (isAuthenticated) {
            accessToken = this.jwtService.sign(
                {sub: userId, email: token.newEmail}, 'access',
                {expiresIn: '15min'},
            );
            newRefreshToken = this.jwtService.sign(
                {sub: userId, email: token.newEmail}, 'refresh',
                {expiresIn: '7d'},
            );
        }

        const hash = await bcrypt.hash(newRefreshToken, PASSWORD_SALT_ROUNDS);

        try {
            // 2. Wrap the Transaction in Try/Catch
            const res = await this.prisma.$transaction(async (tx) => {
                // It is safer to re-check existence or update strictly inside transaction,
                // but catching the delete error is the most direct fix for your issue.

                const user = await tx.user.update({
                    where: {id: token.userId},
                    data: {
                        email: token.newEmail,
                        refreshTokens: isAuthenticated ? [hash] : [],
                    }
                });

                const del = await tx.emailChangeTable.delete({
                    where: {token: hashedToken}
                });

                return {user, del};
            });

            // Send success confirmation email to the new email address
            await this.emailService.sendEmail(
                res.user.email,
                'Email Successfully Updated - Trackd',
                emailChangedSuccessTemplate(res.user.name, res.user.email)
            );

            if (isAuthenticated) {
                usr = {
                    id: userId,
                    name: res.user.name,
                    email: res.user.email,
                    createdAt: res.user.createdAt,
                    username: res.user.username
                };
            }

            return {
                accessToken: accessToken,
                refreshToken: newRefreshToken,
                user: usr,
                message: "Email changed successfully",
            };

        } catch (error) {
            // 3. Catch the specific Prisma error for "Record not found" during delete
            if (error.code === 'P2025') {
                throw new BadRequestException('Invalid token');
            }
            // Re-throw any other actual errors (like DB connection issues, etc.)
            throw error;
        }
    }

    // 1. Generate the URL to send the user to Google
    getGoogleAuthURL() {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

        // Generate a random state parameter for CSRF protection
        const state = randomBytes(32).toString('hex');

        const options = {
            redirect_uri: process.env.GOOGLE_CALLBACK_URL,
            client_id: process.env.GOOGLE_CLIENT_ID,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ].join(' '),
            state, // CSRF protection
        };

        const qs = new URLSearchParams(options);
        return {
            url: `${rootUrl}?${qs.toString()}`,
            state,
        }
    }

    async authenticateUser(usr: User) {
        // Generate JWTs
        const payload = { sub: usr.id, email: usr.email };

        const accessToken = this.jwtService.sign(
            payload,
            'access',
            { expiresIn: '15min' }
        );

        const refreshToken = this.jwtService.sign(
            payload,
            'refresh',
            { expiresIn: '7d' }
        );

        // Save refresh token hash to database
        const hashedRefreshToken = await bcrypt.hash(refreshToken, PASSWORD_SALT_ROUNDS);

        // Limit refresh tokens to max 5 (cleanup old tokens)
        let updatedTokens = [...usr.refreshTokens];
        if (updatedTokens.length >= 5) {
            updatedTokens = updatedTokens.slice(-4); // Keep last 4
        }
        updatedTokens.push(hashedRefreshToken);

        await this.prisma.user.update({
            where: { id: usr.id },
            data: { refreshTokens: updatedTokens },
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: usr.id,
                name: usr.name,
                email: usr.email,
                username: usr.username,
                createdAt: usr.createdAt,
                avatar: usr.avatar,
            }
        };
    }

    // 2. The Core Logic: Code -> Token -> User -> JWT
    async googleLogin(code: string) {
        if (!code) throw new BadRequestException('No authorization code provided');

        // STEP A: Exchange 'code' for 'access_token' using FETCH
        const tokenParams = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        });

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenParams.toString(),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            this.logger.error(`Google Token Error: ${errorData}`);
            throw new BadRequestException('Failed to exchange authorization code');
        }


        const tokenData = await tokenResponse.json(); // Contains access_token

        // STEP B: Get User Profile using FETCH
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.text();
            this.logger.error(`Google Profile Error: ${errorData}`);
            throw new BadRequestException('Failed to fetch user profile from Google');
        }
        const googleUser = await userResponse.json();
        // googleUser = { id: '...', email: '...', verified_email: true, name: '...', picture: '...' }

        // Validate that email is verified
        if (!googleUser.email || !googleUser.verified_email) {
            throw new BadRequestException('Email not verified by Google');
        }


        try {
            // 1. FIRST: check if a user with this GOOGLE account already exists
            let googleUserData = await this.prisma.user.findUnique({
                where: { googleId: googleUser.id },
            });
            if (googleUserData){
                // google user exists simply log him in
                return this.authenticateUser(googleUserData);
            }

            // 2. SECOND: google user doesn't exist but check if SAME EMAIL user exists
            const existingUserByEmail = await this.prisma.user.findUnique({
                where: { email: googleUser.email },
            });
            if(existingUserByEmail) {
                // Emails Match
                // We trust this is the same person. Link the accounts.
                const updatedUser = await this.prisma.user.update({
                    where: { id: existingUserByEmail.id },
                    data: {
                        googleId: googleUser.id,
                        avatar: googleUser.picture // Google returns 'picture', not 'avatar'
                    }
                });

                // accounts linked
                // now rest of auth process
                return this.authenticateUser(updatedUser);
            }

            // 3. THIRD: No Google ID found, No Email match (Case 2)
            // Create a completely new account.
            const newUser = await this.prisma.user.create({
                data: {
                    email: googleUser.email,
                    googleId: googleUser.id,
                    name: googleUser.name,
                    avatar: googleUser.picture,
                    password: null
                }
            });

            // rest of auth flow
            return this.authenticateUser(newUser);

        } catch (error) {
            this.logger.error('Google OAuth Error:', error);
            if (error instanceof BadRequestException || error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Google authentication failed');
        }
    }

}
