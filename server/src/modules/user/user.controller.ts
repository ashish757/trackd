import {Req, Body, Controller, Post, UseGuards, InternalServerErrorException, HttpStatus} from "@nestjs/common";
import {ChangeUsernameDTO} from "./user.dto";
import {AuthGuard} from "../../comman/guards/auth.guard";
import {UserService} from "./user.service";

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private  readonly userService: UserService) {
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