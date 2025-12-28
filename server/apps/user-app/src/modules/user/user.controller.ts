import {Req, Res, Body, Controller, Post, UseGuards, InternalServerErrorException, HttpStatus, Get} from "@nestjs/common";
import { Throttle } from '@nestjs/throttler';
import {
    AcceptFollowRequestDTO, CancelFollowRequestDTO, ChangeBioDTO, ChangeNameDTO,
    ChangePasswordDTO, ChangeUsernameDTO, FollowUserDTO, RejectFollowRequestDTO, UnfollowUserDTO
} from "./DTO/user.dto";
import {AuthGuard} from "@app/common/guards/auth.guard";
import {UserService} from "./user.service";
import type {Request, Response} from "express";
import { CookieConfig } from '../../../../server/src/utils/cookie';

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
    @Throttle({ default: { limit: 15, ttl: 60000 } }) // 15 requests per minute
    async followUser(@Body() followDto: FollowUserDTO, @Req() req: AuthenticatedRequest) {

        const res = await this.userService.followUser(followDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/follow/accept')
    async acceptFollowRequest(@Body() acceptDto: AcceptFollowRequestDTO, @Req() req: AuthenticatedRequest) {
        const res = await this.userService.acceptFollowRequest(acceptDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/follow/reject')
    async rejectFollowRequest(@Body() rejectDto: RejectFollowRequestDTO, @Req() req: AuthenticatedRequest) {
        const res = await this.userService.rejectFollowRequest(rejectDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/follow/cancel')
    async cancelFollowRequest(@Body() cancelDto: CancelFollowRequestDTO, @Req() req: AuthenticatedRequest) {
        const res = await this.userService.cancelFollowRequest(cancelDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/unfollow')
    @Throttle({ default: { limit: 15, ttl: 60000 } }) // 15 requests per minute
    async unfollowUser(@Body() unfollowDto: UnfollowUserDTO, @Req() req:AuthenticatedRequest) {
        const res = await this.userService.unfollowUser(unfollowDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/change/password')
    async changePassword(@Req() req: AuthenticatedRequest, @Body() changePasswordDto: ChangePasswordDTO, @Res({ passthrough: true }) res: Response ) {
        const userId = req.user.sub;
        const data = await this.userService.changePassword(changePasswordDto, userId);

        if(!res) throw new InternalServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR);

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
    async checkUsername(@Body() body: {username: string}) {
        const res = this.userService.checkUsername(body.username);

        if(!res) throw new InternalServerErrorException(HttpStatus.NOT_FOUND);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            ...res
        };
    }


    @Post('change/username')
    async searchUserByQuery(@Req() req: Request & { body : ChangeUsernameDTO, user?: { sub: string; email: string }} ) {
        const userId = req.user.sub;
        const res = await this.userService.changeUsername(userId, req.body);

        if(!res) throw new InternalServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            data: res,
        }
    }

    @Post('change/name')
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