import { Injectable } from '@nestjs/common';
import {RegisterDto} from "./DTO/register.dto";
import {LoginDto} from "./DTO/login.dto";
import {getJWTToken, verifyJWTToken} from "./jwt.strategy";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    validateLoginReq(data: LoginDto): {email: string} {
        // validate user credentials from DB (this is just a placeholder)
        return {email: data.email};
    }

    login(req: LoginDto): { accessToken: string, refreshToken: string } {
        const email = this.validateLoginReq(req);

        const payload = { email: email };
        return {
            accessToken: getJWTToken(payload),
            refreshToken: getJWTToken(payload),
        };

    }
    async getHash(password: string): Promise<string> {
        const saltRounds = 5; // higher = more secure but slower
        return await bcrypt.hash(password, saltRounds);
    }

    async sendOtp(data: RegisterDto): Promise<{ statusCode: number,  otpToken: string, error?: string }>  {
        // send OTP code (this is just a placeholder)
        console.log("Sending OTP to ", data.email);
        try {
            const otp = 123456;
            console.log("OTP ", otp);
            const payload = {
                email: data.email,
                passwordH: await this.getHash(data.password),
                otp: await this.getHash(otp.toString())
            }

            return {statusCode: 200, otpToken: getJWTToken(payload)};
        }
        catch (error) {
            return {statusCode: 500, otpToken: "", error: error};
        }
    }

    register(data: RegisterDto): { accessToken: string; refreshToken: string }  {
        // save user to DB (this is just a placeholder)

        const accessToken = getJWTToken({ email: data.email });
        const refreshToken = getJWTToken({ email: data.email });

        return { accessToken, refreshToken} ;
    }

    verifyOtp(req:{ otpToken: string, otp: number, user: RegisterDto}): { status: boolean, message?: string }  {{
        // verify OTP code (this is just a placeholder)
        const payload = verifyJWTToken(req.otpToken);
        if(payload) {
            if(payload.email === req.user.email) {
                this.register(req.user);
                return {status: true, message: "User Registered successfully"};
            } else {
                return {status: false, message: "Invalid or expired OTP token"};
            }
        }

        return {status: false, message: "No OTP token"};
    }


    }
}
