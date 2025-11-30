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
import {sendEmail} from "../../utils/email";
import {PASSWORD_SALT_ROUNDS} from "../../utils/constants";
const htmlTemplate = (name, otp) => `
  <div style="
    font-family: Arial, sans-serif;
    background-color: #f6f9fc;
    padding: 20px;
    border-radius: 10px;
    color: #333;
  ">
    <div style="
      max-width: 500px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    ">
      <h2 style="text-align:center; color:#2563eb;">Trackd - Email Verification</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Here’s your one-time verification code:</p>
      
      <div style="
        text-align:center;
        font-size: 28px;
        font-weight: bold;
        color: #2563eb;
        margin: 15px 0;
      ">
        ${otp}
      </div>
      
      <p>This code is valid for <strong>3 minutes</strong>.</p>
      <p>If you didn’t request this, please ignore this email.</p>
      
      <hr style="margin-top:25px; border:none; border-top:1px solid #eee;">
      <p style="text-align:center; font-size:12px; color:#777;">
        © ${new Date().getFullYear()} Trackd. All rights reserved.
      </p>
    </div>
  </div>
`;


@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string, user: object }> {
        // verify user from DB
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
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
        const payload = { sub: user.id, email: user.email };


        const data = {
            accessToken: this.jwtService.sign(payload, 'access', { expiresIn: '15min' }),
            refreshToken: this.jwtService.sign(payload, 'refresh', { expiresIn: '7d' }),
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
            where: { id: user.id },
            data: { refreshTokens: updatedTokens },
        });

        return {...data, user: {
            id: user.id,
            name: user.name,
            email: user.email,
                username: user.username,
            createdAt: user.createdAt,
            }};
    }


    async sendOtp(otpDto: SendOtpDto) {
        // Generate random 6-digit OTP
        const otp = generateOTP();

        console.log('Sending OTP to', otpDto.email);
        // await sendEmail(otpDto.email, 'Trackd - Email Verification Code', `Hello <strong> ${otpDto.name} </strong>, <br/> <br/> Your One Time Verification code is: <strong>${otp} </strong>. <br/> It is valid for 03 minutes.`);
        await sendEmail(
            "ashishrajsingh75@gmail.com",
            'Trackd - Email Verification Code',
            htmlTemplate(otpDto.name, otp)
        );

        console.log('OTP:', otp);

        const payload = {
            email: otpDto.email,
            otp: await bcrypt.hash(otp, PASSWORD_SALT_ROUNDS),
        };
        return { otpToken: this.jwtService.sign(payload, 'otp') };
    }

    async register(dto: UserDto) {
        // save user to DB
        const existing = await this.prisma.user.findUnique({
            where: { email:  dto.email },
            select: { id: true, },
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
            { sub: user.id, email: user.email }, 'access',
            { expiresIn: '15min' },
        );
        const refreshToken = this.jwtService.sign(
            { sub: user.id, email: user.email }, 'refresh',
            { expiresIn: '7d' },
        );

        const hashedToken = await bcrypt.hash(refreshToken, PASSWORD_SALT_ROUNDS);

        // Update user with refresh token
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokens: [hashedToken] },
        });

        return { accessToken, refreshToken, user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                createdAt: user.createdAt,
            }};
    }

    async logout(userId: string, refreshToken: string): Promise<void> {
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

    async logoutAll(userId: string): Promise<void> {
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
            select: { id: true, name: true,
                email: true,
                username: true,
                createdAt: true, refreshTokens: true },
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
            where: { id: user.id },
            data: { refreshTokens: updatedTokens },
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
}
