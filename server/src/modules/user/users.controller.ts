import {Controller, Get, HttpStatus, Param, Query} from "@nestjs/common";
import {UserService} from "./user.service";

@Controller('users')
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


    @Get("/:username")
    async getUserById(@Param('username') username: string) {
        console.log("username", username);
        const res = await this.userService.getUserByUsername(username);

        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res
        }

    }

}