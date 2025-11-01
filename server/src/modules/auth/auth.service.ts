import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { VerifyOtpDto, OtpDto, UserDto } from './DTO/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './DTO/login.dto';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcrypt';

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
            accessToken: this.jwtService.sign(payload, 'access', { expiresIn: '10min' }),
            refreshToken: this.jwtService.sign(payload, 'refresh', { expiresIn: '7d' }),
        }

        const hashed = await this.getHash(data.refreshToken);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokens: [...user.refreshTokens, hashed] },
        });

        return data;
    }

    async getHash(password: string): Promise<string> {
        const saltRounds = 12; // higher = more secure but slower
        return await bcrypt.hash(password, saltRounds);
    }

    async sendOtp(otpDto: OtpDto) {
        // Generate random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log('Sending OTP to', otpDto.email);
        console.log('OTP:', otp); // TODO: Remove in production, send via email/SMS

        const payload = {
            email: otpDto.email,
            otp: await this.getHash(otp.toString()),
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
            { expiresIn: '10min' },
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

    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        // verify OTP code (this is just a placeholder)
        const { payload, error } = this.jwtService.verify(
            verifyOtpDto.token, 'otp'
        ) as { error: boolean | object; payload: VerifyOtpDto };
        if (error) return false;

        if (
            payload.email === verifyOtpDto.email &&
            (await bcrypt.compare(verifyOtpDto.otp, payload.otp))
        )
            return true;

        return false;
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
            throw new UnauthorizedException('Refresh token not found or has been revoked');
        }

        // Generate new tokens
        const accessToken = this.jwtService.sign(
            { sub: user.id, email: user.email }, 'access',
            { expiresIn: '10min' },
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
