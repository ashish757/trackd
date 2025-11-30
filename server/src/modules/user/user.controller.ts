import {Req, Res, Body, Controller, Post, UseGuards, InternalServerErrorException, HttpStatus, Get} from "@nestjs/common";
import {
    AcceptFollowRequestDTO, CancelFollowRequestDTO,
    ChangePasswordDTO, ChangeUsernameDTO, FollowUserDTO, RejectFollowRequestDTO, UnfollowUserDTO
} from "./user.dto";
import {AuthGuard} from "../../common/guards/auth.guard";
import {UserService} from "./user.service";
import type {Request, Response} from "express";

interface AuthenticatedRequest extends Request {
    user?: {
        sub: string;
        email: string;
    };
}

@Controller('user')
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
    async unfollowUser(@Body() unfollowDto: UnfollowUserDTO, @Req() req:AuthenticatedRequest) {
        const res = await this.userService.unfollowUser(unfollowDto, req.user.sub);
        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }
    }

    @Post('/change-password')
    async changePassword(@Req() req: AuthenticatedRequest, @Body() changePasswordDto: ChangePasswordDTO, @Res({ passthrough: true }) res: Response ) {
        const userId = req.user.sub;
        const data = await this.userService.changePassword(changePasswordDto, userId);

        if(!res) throw new InternalServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR);

        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.ENV === 'production',
            sameSite: process.env.ENV == "production" ? "none" : "lax" ,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            data: {
                accessToken: data.accessToken,
                message: 'Password changed successfully'
            },
        }
    }




    @Post('change-username')
    async searchUserByQuery(@Req() req: Request & { body : ChangeUsernameDTO, user?: { sub: string; email: string }} ) {
        const userId = req.user.sub;
        const res = await this.userService.changeUsername(userId, req.body);

        if(!res) throw new InternalServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: res.message,
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







}