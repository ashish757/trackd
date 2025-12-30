import {Req, Res, Body, Controller, Post, UseGuards, HttpStatus, Get} from "@nestjs/common";
import { Throttle } from '@nestjs/throttler';
import {
    AcceptFollowRequestDTO, CancelFollowRequestDTO, ChangeBioDTO, ChangeNameDTO,
    ChangePasswordDTO, ChangeUsernameDTO, FollowUserDTO, RejectFollowRequestDTO, UnfollowUserDTO
} from "./DTO/user.dto";
import {AuthGuard} from "@app/common/guards/auth.guard";
import {UserService} from "./user.service";
import type {Request, Response} from "express";
import { CookieConfig, RateLimitConfig } from '@app/common';

interface AuthenticatedRequest extends Request {
    user?: {
        sub: string;
        email: string;
    };
}

@Controller()
@UseGuards(AuthGuard)
export class UserController {
    constructor(private  readonly userService: UserService) {
    }

    @Get()
    async getUser(@Req() req: AuthenticatedRequest) {
        const res = await this.userService.getUser(req.user.sub);

        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }

    }

    @Post('/follow')
    @Throttle({ default: RateLimitConfig.MODERATE.FRIEND_REQUEST })
    async followUser(@Body() followDto: FollowUserDTO, @Req() req: AuthenticatedRequest) {

        const res = await this.userService.followUser(followDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/follow/accept')
    @Throttle({ default: RateLimitConfig.MODERATE.FRIEND_REQUEST })
    async acceptFollowRequest(@Body() acceptDto: AcceptFollowRequestDTO, @Req() req: AuthenticatedRequest) {
        const res = await this.userService.acceptFollowRequest(acceptDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/follow/reject')
    @Throttle({ default: RateLimitConfig.MODERATE.FRIEND_REQUEST })
    async rejectFollowRequest(@Body() rejectDto: RejectFollowRequestDTO, @Req() req: AuthenticatedRequest) {
        const res = await this.userService.rejectFollowRequest(rejectDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/follow/cancel')
    @Throttle({ default: RateLimitConfig.MODERATE.FRIEND_REQUEST })
    async cancelFollowRequest(@Body() cancelDto: CancelFollowRequestDTO, @Req() req: AuthenticatedRequest) {
        const res = await this.userService.cancelFollowRequest(cancelDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/unfollow')
    @Throttle({ default: RateLimitConfig.MODERATE.FOLLOW_UNFOLLOW })
    async unfollowUser(@Body() unfollowDto: UnfollowUserDTO, @Req() req:AuthenticatedRequest) {
        const res = await this.userService.unfollowUser(unfollowDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/change/password')
    @Throttle({ default: RateLimitConfig.MODERATE.UPDATE_PROFILE })
    async changePassword(@Req() req: AuthenticatedRequest, @Body() changePasswordDto: ChangePasswordDTO, @Res({ passthrough: true }) res: Response ) {
        const userId = req.user.sub;
        const data = await this.userService.changePassword(changePasswordDto, userId);

        CookieConfig.setRefreshTokenCookie(res, data.refreshToken);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            data: {
                accessToken: data.accessToken,
                message: 'Password changed successfully'
            },
        }
    }

    @Post("check-username")
    @Throttle({ default: RateLimitConfig.RELAXED.GET_USER })
    async checkUsername(@Body() body: {username: string}) {
        const data = await this.userService.checkUsername(body.username);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            ...data
        };
    }


    @Post('change/username')
    @Throttle({ default: RateLimitConfig.MODERATE.UPDATE_PROFILE })
    async searchUserByQuery(@Req() req: Request & { body : ChangeUsernameDTO, user?: { sub: string; email: string }} ) {
        const userId = req.user.sub;
        const data = await this.userService.changeUsername(userId, req.body);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            data,
        }
    }

    @Post('change/name')
    @Throttle({ default: RateLimitConfig.MODERATE.UPDATE_PROFILE })
    async changeName(@Req() req: AuthenticatedRequest, @Body() dto: ChangeNameDTO ) {
        const userId = req.user.sub;
        const res = await this.userService.changeName(dto, userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            data: res,
        }

    }


    @Post('change/bio')
    @Throttle({ default: RateLimitConfig.MODERATE.UPDATE_PROFILE })
    async changeBio(@Req() req: AuthenticatedRequest, @Body() dto: ChangeBioDTO ) {
        const userId = req.user.sub;
        const res = await this.userService.changeBio(dto, userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            data: res,
        }
    }

}