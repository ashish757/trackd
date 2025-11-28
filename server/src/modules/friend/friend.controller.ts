import {Body, Get, Controller, HttpStatus, InternalServerErrorException, Post, Req, UseGuards} from "@nestjs/common";
import {FriendRequestDto} from "./DTO/friend.dto";
import FriendService from "./friend.service";
import {AuthGuard} from "../../common/guards/auth.guard";
import {Request} from "express";

@Controller('friend')
@UseGuards(AuthGuard)
export default class FriendController {

    constructor(private readonly friendService: FriendService) {
    }

    @Post("/send-request")
    followUser(@Body() requestBody: FriendRequestDto) {
        // Logic to follow a user
        const res = this.friendService.createFriendReq(requestBody);
        if(!res) throw new InternalServerErrorException(HttpStatus.NOT_FOUND);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: res.message,
        }
    }

    @Get("/requests")
    async getFriendRequests(@Req() req: Request & { user?: { sub: string; email: string }}) {
        // Logic to get friend requests
        const data = await this.friendService.getFriendRequests(req.user.sub);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Friend requests fetched successfully',
            data: data
        }
    }

}