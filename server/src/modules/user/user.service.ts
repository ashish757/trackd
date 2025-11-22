import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {ChangeUsernameDTO} from "./user.dto";

@Injectable()
export class UserService {

    constructor(private readonly prisma: PrismaService ) {
    }

    async getUser(id: string){
        const res = this.prisma.user.findUnique({where: {id}});

        if(!res) throw new UnauthorizedException("CRITICAL: User not found");

        return res;
    }

    async checkUsername(username: string ) {
        const find = this.prisma.user.findUnique({ where: { username } });

        if (find) return {
            exists: true,
            username: username,
            message: "Username already exists",
        }
        else return {
            exists: false,
            username: username,
            message: "valid username",
        }

    }

    async changeUsername(userId, dto: ChangeUsernameDTO) {
        // check if there exists a user with the new username
        const exists =  await this.prisma.user.findUnique({
            where: {username: dto.username}
        })

        if(exists) throw new UnauthorizedException("A user with same username already exists");

        const res = await this.prisma.user.update({
            where: {id: userId},
            data: {username: dto.username},
        })

        if(!res) throw new UnauthorizedException('Could not update username');

        return {
            message: 'Username updated',
        };
    }

    async searchUsersByQuery(q: string) {
        return  this.prisma.user.findMany({
            where: {username: q},
        })


    }







}