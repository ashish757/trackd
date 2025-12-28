import {Controller, Get, Req, HttpStatus, Param, Query, UseGuards} from "@nestjs/common";
import {UserService} from "./user.service";
import {Request} from "express";
import {OptionalAuthGuard} from "@app/common/guards/optionalAuth.guard";

@Controller()
export class UsersController {
    constructor(private readonly userService: UserService) {}


    @Get("/search")
    async searchUserByQuery(@Query('query') q: string) {
        if(q.length == 0) return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: []

        }

        const res =  await this.userService.searchUsersByQuery(q);


        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res

        }

    }

    @UseGuards(OptionalAuthGuard)
    @Get("/:username")
    async getUserByUsername(@Param('username') username: string, @Req() req: Request & { user?: { sub: string } }) {
        const currentUserId = req.user?.sub || null;
        const res = await this.userService.getUserByUsername(username, currentUserId);

        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }

    }

}