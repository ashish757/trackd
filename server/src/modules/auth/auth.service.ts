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
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './DTO/login.dto';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcrypt';
import {generateOTP} from "../../utils/otp";
import {sendEmail} from "../../utils/email";
import {PASSWORD_SALT_ROUNDS} from "../../utils/constants";
import {randomBytes} from "node:crypto";
import crypto from 'crypto';
import {changeEmailRequestTemplate, otpTemplate, passwordResetTemplate} from "../../utils/emailTemplates";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) { }

    async forgetPassword(dto: ForgetPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: {email: dto.email},
            select: {id: true, name: true, email: true, username: true},
        });

        if (user) {
            const token = randomBytes(32).toString('hex'); // 64 characters

            // const hashedToken = await bcrypt.hash(token, PASSWORD_SALT_ROUNDS);
            // Create Hash to store in DB
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const resetLink = `http://localhost:5173/forget-password?token=${token}`;

            // await sendEmail(user.email, 'Trackd - Password Reset', `Hello <strong> ${user.name} </strong>, <br/> <br/> Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 15 minutes.`);
            await sendEmail("ashishrajsingh75@gmail.com", "Password Reset - Trackd", passwordResetTemplate(user.name, resetLink));


            const res = await this.prisma.passwordResetToken.create({
                data: {
                    user: {
                        connect: {id: user.id},
                    },
                    token: hashedToken,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 mins
                },
            });


            if (!res) throw new InternalServerErrorException("Failed to create password reset token");

        }

        return {message: 'Password reset link sent'};
    }

    async resetPassword(dto: ResetPasswordDto) {

        const hash = crypto
            .createHash('sha256')
            .update(dto.token)
            .digest('hex');

        const token = await this.prisma.passwordResetToken.findUnique({
            where: {token: hash},
            include: {user: true},
        });

        if (!token || token.expiresAt < new Date()) {
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

        return {message: 'Password has been reset successfully'};
    }

    async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string, user: object }> {
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
            }

        });
        if (!user) throw new UnauthorizedException('Invalid email');

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new UnauthorizedException('Invalid password');
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
        }
        updatedTokens.push(hashed);

        await this.prisma.user.update({
            where: {id: user.id},
            data: {refreshTokens: updatedTokens},
        });

        return {
            ...data, user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                createdAt: user.createdAt,
            }
        };
    }

    async sendOtp(otpDto: SendOtpDto) {
        // Generate random 6-digit OTP
        const otp = generateOTP();

        console.log('Sending OTP to', otpDto.email);
        // await sendEmail(otpDto.email, 'Trackd - Email Verification Code', `Hello <strong> ${otpDto.name} </strong>, <br/> <br/> Your One Time Verification code is: <strong>${otp} </strong>. <br/> It is valid for 03 minutes.`);
        await sendEmail(
            "ashishrajsingh75@gmail.com",
            'Trackd - Email Verification Code',
            otpTemplate(otpDto.name, otp)
        );

        console.log('OTP:', otp);

        const payload = {
            email: otpDto.email,
            otp: await bcrypt.hash(otp, PASSWORD_SALT_ROUNDS),
        };
        return {otpToken: this.jwtService.sign(payload, 'otp')};
    }

    async register(dto: UserDto) {
        // save user to DB
        const existing = await this.prisma.user.findUnique({
            where: {email: dto.email},
            select: {id: true,},
        });

        if (existing) throw new ConflictException('Email already in use');

        const hashed = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

        // Create user first to get the ID
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashed,
            },
        });

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
                createdAt: user.createdAt,
            }
        };
    }

    async logout(userId: string, refreshToken: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: {refreshTokens: true},
        });

        if (!user) return;

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
                username: true,
                createdAt: true, refreshTokens: true
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
            console.warn(`Token reuse detected for user ${user.id}. Invalidating all tokens.`);
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
            }
        };
    }

    async changeEmailRequest(dto: ChangeEmailRequestDto, userId: string, email: string) {
        if (dto.newEmail == email) {
            return {
                message: 'Email already taken',
            };
        }

        const userExists = await this.prisma.user.findUnique({
            where: {email: dto.newEmail},
            select: {id: true, name: true},
        });

        if (userExists) throw new ConflictException('Email already in use');

        // send mail to older email
        sendEmail('ashishrajsingh75@gmail.com', 'Trackd - Email Change Request', changeEmailRequestTemplate(userExists.name, dto.newEmail));

        const token = randomBytes(32).toString('hex'); // 64 characters

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');


        const changeLink = `http://localhost:5173/change/email?token=${token}`;

        // send link to new email
        await sendEmail("ashishrajsingh75@gmail.com", "Email Change - Trackd", changeLink);

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


        if (!res) throw new InternalServerErrorException("Failed to create password reset token");

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

    // 2. The Core Logic: Code -> Token -> User -> JWT
    async googleLogin(code: string) {
        if (!code) throw new BadRequestException('No authorization code provided');

        try {
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
                console.error('Google Token Error:', errorData);
                throw new BadRequestException('Failed to exchange authorization code');
            }

            const tokenData = await tokenResponse.json(); // Contains access_token

            // STEP B: Get User Profile using FETCH
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.text();
                console.error('Google Profile Error:', errorData);
                throw new BadRequestException('Failed to fetch user profile from Google');
            }

            const googleUser = await userResponse.json();
            // googleUser = { id: '...', email: '...', verified_email: true, name: '...', picture: '...' }

            // Validate that email is verified
            if (!googleUser.email || !googleUser.verified_email) {
                throw new BadRequestException('Email not verified by Google');
            }

            // STEP C: Database Logic (Find or Create)
            let user = await this.prisma.user.findUnique({
                where: { email: googleUser.email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    createdAt: true,
                    googleId: true,
                    avatar: true,
                    refreshTokens: true,
                }
            });

            if (!user) {
                // Create new user with Google OAuth
                user = await this.prisma.user.create({
                    data: {
                        email: googleUser.email,
                        name: googleUser.name || 'User',
                        googleId: googleUser.id,
                        avatar: googleUser.picture,
                        password: null, // No password for OAuth users
                        // username will be auto-generated (cuid)
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                        createdAt: true,
                        googleId: true,
                        avatar: true,
                        refreshTokens: true,
                    }
                });
            } else if (!user.googleId) {
                // Link existing email account with Google
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: googleUser.id,
                        avatar: googleUser.picture || user.avatar
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                        createdAt: true,
                        googleId: true,
                        avatar: true,
                        refreshTokens: true,
                    }
                });
            }

            // STEP D: Generate YOUR JWTs
            const payload = { sub: user.id, email: user.email };

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

            // STEP E: Save refresh token hash to database
            const hashedRefreshToken = await bcrypt.hash(refreshToken, PASSWORD_SALT_ROUNDS);

            // Limit refresh tokens to max 5 (cleanup old tokens)
            let updatedTokens = [...user.refreshTokens];
            if (updatedTokens.length >= 5) {
                updatedTokens = updatedTokens.slice(-4); // Keep last 4
            }
            updatedTokens.push(hashedRefreshToken);

            await this.prisma.user.update({
                where: { id: user.id },
                data: { refreshTokens: updatedTokens },
            });

            return {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    createdAt: user.createdAt,
                    avatar: user.avatar,
                }
            };

        } catch (error) {
            console.error('Google OAuth Error:', error);
            if (error instanceof BadRequestException || error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Google authentication failed');
        }
    }

}
