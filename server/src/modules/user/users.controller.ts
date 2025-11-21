import {Controller, Get, HttpStatus, InternalServerErrorException, Query} from "@nestjs/common";
import {UserService} from "./user.service";

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UserService) {}

    @Get("/search")
    async searchUserByQuery(@Query('q') q: string) {
        const res =  await this.userService.searchUsersByQuery(q);

        if(!res) throw new InternalServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR);

        return {
            status: "success",
            statusCode: HttpStatus.OK,
            data: res

        }

    }

}