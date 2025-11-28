import {ConflictException, Injectable, InternalServerErrorException, UnauthorizedException} from "@nestjs/common";
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

    async getUserByUsername(username: string, currentUserId?: string) {
        const user = await this.prisma.user.findUnique({
            where: { username: username },
            select: {
                id: true,
                name: true,
                username: true,
                createdAt: true,
            }
        });

        if (!user) throw new UnauthorizedException("invalid username");

        // If authenticated, check relationship status
        let relationshipStatus = null;
        if (currentUserId && currentUserId !== user.id) {
            relationshipStatus = await this.getRelationshipStatus(currentUserId, user.id);
        }


        return {
            ...user,
            relationshipStatus
        };
    }

    async getRelationshipStatus(currentUserId: string, targetUserId: string) {
        // Check if they are friends
        const friendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { friend_a_id: currentUserId, friend_b_id: targetUserId },
                    { friend_a_id: targetUserId, friend_b_id: currentUserId }
                ]
            }
        });

        if (friendship) {
            return 'FOLLOWING';
        }

        // Check if current user sent a request to target user
        const sentRequest = await this.prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: currentUserId,
                    receiverId: targetUserId
                }
            }
        });

        if (sentRequest) {
            return 'REQUEST_SENT';
        }

        // Check if target user sent a request to current user
        const receivedRequest = await this.prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: targetUserId,
                    receiverId: currentUserId
                }
            }
        });

        if (receivedRequest) {
            return 'REQUEST_RECEIVED';
        }

        return 'NONE';
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

        if(exists) throw new ConflictException("Username already exists");

        const res = await this.prisma.user.update({
            where: {id: userId},
            data: {username: dto.username},
        })

        if(!res) throw new InternalServerErrorException('Could not update username');

        return {
            message: 'Username updated',
        };
    }

    async searchUsersByQuery(q: string) {
        const search = q.trim();


        try {
            return await this.prisma.$queryRaw`
                SELECT * FROM users
                WHERE username ILIKE ${'%' + search + '%'} 
                OR name ILIKE ${'%' + search + '%'} 
                ORDER BY 
                    (username ILIKE ${'%' + search + '%'}) DESC,
                    (name ILIKE ${'%' + search + '%'}) DESC; ;
          `;

        } catch (err) {
            console.error("Raw SQL error:", err);
            throw err; // or throw new InternalServerErrorException('DB error')
        }


        // return users;


    }

}