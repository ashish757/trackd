import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { VerifyOtpDto, SendOtpDto, UserDto } from './DTO/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './DTO/login.dto';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcrypt';
import {generateOTP} from "../../utils/otp";
import {sendMail} from "../../utils/email";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
        // verify user from DB
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: {
                id: true,
                email: true,
                password: true,
                refreshTokens: true,
            }

        });
        if (!user) throw new UnauthorizedException('Invalid email');

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new UnauthorizedException('Invalid password');
        const payload = { sub: user.id, email: user.email };


        const data = {
            accessToken: this.jwtService.sign(payload, 'access', { expiresIn: '15min' }),
            refreshToken: this.jwtService.sign(payload, 'refresh', { expiresIn: '7d' }),
        }

        const hashed = await this.getHash(data.refreshToken);

        // Limit refresh tokens to max 5 (cleanup old tokens)
        let updatedTokens = [...user.refreshTokens];
        if (updatedTokens.length >= 5) {
            // Remove oldest tokens
            updatedTokens = updatedTokens.slice(-4); // Keep last 4
        }
        updatedTokens.push(hashed);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokens: updatedTokens },
        });

        return data;
    }

    async getHash(password: string): Promise<string> {
        const saltRounds = 12; // higher = more secure but slower
        return await bcrypt.hash(password, saltRounds);
    }

    async sendOtp(otpDto: SendOtpDto) {
        // Generate random 6-digit OTP
        const otp = generateOTP();

        console.log('Sending OTP to', otpDto.email);
        sendMail(otpDto.email, 'Trackd - Email Verification Code', `Hello <strong> ${otpDto.name} </strong>, <br/> <br/> Your One Time Verification code is: <strong>${otp} </strong>. <br/> It is valid for 03 minutes.`);
        console.log('OTP:', otp);

        const payload = {
            email: otpDto.email,
            otp: await this.getHash(otp),
        };
        return { otpToken: this.jwtService.sign(payload, 'otp') };
    }

    async register(dto: UserDto) {
        // save user to DB
        const existing = await this.prisma.user.findUnique({
            where: { email:  dto.email },
            select: { id: true }
        });
        if (existing) throw new ConflictException('Email already in use');

        const hashed = await this.getHash(dto.password);

        // Create user first to get the ID
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashed,
            },
        });

        const accessToken = this.jwtService.sign(
            { sub: user.id, email: user.email }, 'access',
            { expiresIn: '15min' },
        );
        const refreshToken = this.jwtService.sign(
            { sub: user.id, email: user.email }, 'refresh',
            { expiresIn: '7d' },
        );

        const hashedToken = await this.getHash(refreshToken);

        // Update user with refresh token
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokens: [hashedToken] },
        });

        return { accessToken, refreshToken };
    }

    // ...existing code...

    async logout(userId: number, refreshToken: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { refreshTokens: true },
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
            where: { id: userId },
            data: { refreshTokens: updatedTokens },
        });
    }

    async logoutAll(userId: number): Promise<void> {
        // Invalidate all refresh tokens for a user
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokens: [] },
        });
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        // verify OTP code (this is just a placeholder)
        const { payload, error } = this.jwtService.verify(
            verifyOtpDto.token, 'otp'
        ) as { error: boolean | object; payload: VerifyOtpDto };
        if (error) return false;

        return !!(payload.email === verifyOtpDto.email &&
            (await bcrypt.compare(verifyOtpDto.otp, payload.otp)));

    }

    async refreshToken(refreshToken: string) {
        const { payload, error } = this.jwtService.verify(
            refreshToken, 'refresh',
        ) as { error: boolean | object; payload: any };

        if (error) throw new UnauthorizedException('Invalid refresh token');

        // check if refresh token is in DB
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, refreshTokens: true },
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
            console.warn(`⚠️ Token reuse detected for user ${user.id}. Invalidating all tokens.`);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { refreshTokens: [] },
            });
            throw new UnauthorizedException('Refresh token not found or has been revoked. All sessions invalidated.');
        }

        // Generate new tokens
        const accessToken = this.jwtService.sign(
            { sub: user.id, email: user.email }, 'access',
            { expiresIn: '15min' },
        );
        const newRefreshToken = this.jwtService.sign(
            { sub: user.id, email: user.email }, 'refresh',
            { expiresIn: '7d' },
        );

        // Update refresh tokens in DB (token rotation)
        const hashedNewToken = await this.getHash(newRefreshToken);

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
            where: { id: user.id },
            data: { refreshTokens: updatedTokens },
        });

        return { accessToken, refreshToken: newRefreshToken };
    }
}
