import { IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
    @IsEmail() email: string;
    @IsString() @MinLength(3) name: string;
    @IsString() @MinLength(6) password: string;
}

export class RegisterDto {
    @IsString() otpToken: string;
    @IsString() otp: string;
    @ValidateNested() @Type(() => UserDto) user: UserDto;
}

export class SendOtpDto {
    @IsString() name: string; // e.g., 'register', 'reset-password'
    @IsEmail() email: string;
}

export class VerifyOtpDto {
    @IsString() token: string;
    @IsEmail() email: string;
    @IsString() otp: string;
}

export class OtpTestDto {
    @IsEmail() email: string;
}
export class ForgetPasswordDto {
    @IsEmail() email: string;
}

export class ResetPasswordDto {
    @IsString() newPassword: string;
    @IsString() token: string
}

export class ChangeEmailRequestDto {
    @IsEmail() newEmail: string;
}

export class ChangeEmailDto {
    @IsString() token: string;

}