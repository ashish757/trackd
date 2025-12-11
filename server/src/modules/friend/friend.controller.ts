import {Body, Get, Controller, HttpStatus, InternalServerErrorException, Post, Req, UseGuards, Param} from "@nestjs/common";
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

    /**
     * Get friend list of a user (only accessible if requester is a friend)
     * GET /friend/list/:userId
     */
    @Get("/list/:userId")
    async getUserFriendList(
        @Param('userId') targetUserId: string,
        @Req() req: Request & { user?: { sub: string; email: string }}
    ) {
        const requesterId = req.user.sub;
        const data = await this.friendService.getUserFriendList(targetUserId, requesterId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Friend list fetched successfully',
            data: data
        };
    }

    /**
     * Get user's movie statistics (only accessible if requester is a friend)
     * GET /friend/movies/:userId
     */
    @Get("/movies/:userId")
    async getUserMovieStats(
        @Param('userId') targetUserId: string,
        @Req() req: Request & { user?: { sub: string; email: string }}
    ) {
        const requesterId = req.user.sub;
        const data = await this.friendService.getUserMovieStats(targetUserId, requesterId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Movie stats fetched successfully',
            data: data
        };
    }

    /**
     * Get current user's own friend list
     * GET /friend/my-friends
     */
    @Get("/my-friends")
    async getMyFriendList(
        @Req() req: Request & { user?: { sub: string; email: string }}
    ) {
        const userId = req.user.sub;
        const data = await this.friendService.getMyFriendList(userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Friend list fetched successfully',
            data: data
        };
    }

}