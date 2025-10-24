import {Injectable, UnauthorizedException} from '@nestjs/common';
import {VerifyOtpDto,OtpDto, RegisterDto, UserDto} from './DTO/register.dto';
import { LoginDto } from './DTO/login.dto';
import { JwtService} from './jwt.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService) {
    }

    validateLoginReq(data: LoginDto): { email: string } {
        // validate user credentials from DB (this is just a placeholder)
        return { email: data.email };
    }

    login(loginDto: LoginDto): { accessToken: string; refreshToken: string } {
        const email = this.validateLoginReq(loginDto);

        const payload = { sub: 1, email: email };
        return {
            accessToken: this.jwtService.sign(payload, {expiresIn: '10min'}),
            refreshToken: this.jwtService.sign(payload, {expiresIn: '7d'}),
        };
    }

    async getHash(password: string): Promise<string> {
        const saltRounds = 5; // higher = more secure but slower
        return await bcrypt.hash(password, saltRounds);
    }

    async sendOtp(otpDto: OtpDto) {
        // send OTP code (this is just a placeholder)
        console.log('Sending OTP to ', otpDto.email);
        const otp = 123456;
        console.log('OTP ', otp);
        const payload = {
            email: otpDto.email,
            otp: await this.getHash(otp.toString()),
        };
        return { otpToken: this.jwtService.sign(payload) };
    }

    register(userDto: UserDto) {
        // save user to DB (this is just a placeholder)

        const accessToken = this.jwtService.sign({ email: userDto.email }, {expiresIn: '10min'});
        const refreshToken = this.jwtService.sign({ email: userDto.email }, {expiresIn: '7d'});

        return { accessToken, refreshToken };
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto)  {
            // verify OTP code (this is just a placeholder)
            const {payload, error} = this.jwtService.verify(verifyOtpDto.token) as { error: boolean | object,  payload : VerifyOtpDto };
            if(error) return false

            if (payload.email === verifyOtpDto.email && await bcrypt.compare(verifyOtpDto.otp, payload.otp)) return true;

            return false;
    }

}
