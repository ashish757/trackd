import {ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {AcceptFollowRequestDTO, CancelFollowRequestDTO, ChangeUsernameDTO, FollowUserDTO, RejectFollowRequestDTO, UnfollowUserDTO} from "./user.dto";

@Injectable()
export class UserService {

    constructor(private readonly prisma: PrismaService ) {
    }

    async followUser(followDto: FollowUserDTO, id: string) {
        // check if a request already exists
        const existingRequest = await this.prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: id,
                    receiverId: followDto.id,
                }
            }
        });

        if (existingRequest) {
            // Request already exists, just return success
            return { message: 'Friend request already sent' };
        }

        // Check if they are already friends
        const existingFriendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { friend_a_id: id, friend_b_id: followDto.id },
                    { friend_a_id: followDto.id, friend_b_id: id }
                ]
            }
        });

        if (existingFriendship) {
            // Already friends
            return { message: 'Already friends' };
        }

        // create a request
        await this.prisma.friendRequest.create({
            data: {
                senderId: id,
                receiverId: followDto.id,
            }
        });

        return { message: 'Friend request sent successfully' };
    }

    async acceptFollowRequest(dto: AcceptFollowRequestDTO, currentUserId: string) {
        // Find the friend request
        const friendRequest = await this.prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: dto.requesterId,
                    receiverId: currentUserId,
                }
            }
        });

        if (!friendRequest) {
            throw new NotFoundException('Friend request not found');
        }

        // Use a transaction to delete request and create friendship
        await this.prisma.$transaction(async (tx) => {
            // Delete the friend request
            await tx.friendRequest.delete({
                where: {
                    senderId_receiverId: {
                        senderId: dto.requesterId,
                        receiverId: currentUserId,
                    }
                }
            });

            // Create friendship (ensure friend_a_id < friend_b_id for consistency)
            const [friendAId, friendBId] = [dto.requesterId, currentUserId].sort();

            await tx.friendship.create({
                data: {
                    friend_a_id: friendAId,
                    friend_b_id: friendBId,
                }
            });

                await tx.user.update({ where: { id: friendAId }, data: { friendCount: { increment: 1 } } });
                await tx.user.update({ where: { id: friendBId }, data: { friendCount: { increment: 1 } } });

        });

        return { message: 'Friend request accepted successfully' };
    }

    async rejectFollowRequest(dto: RejectFollowRequestDTO, currentUserId: string) {
        // Find the friend request
        const friendRequest = await this.prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: dto.requesterId,
                    receiverId: currentUserId,
                }
            }
        });

        if (!friendRequest) {
            throw new NotFoundException('Friend request not found');
        }

        // Delete the friend request
        await this.prisma.friendRequest.delete({
            where: {
                senderId_receiverId: {
                    senderId: dto.requesterId,
                    receiverId: currentUserId,
                }
            }
        });

        return { message: 'Friend request rejected successfully' };
    }

    async cancelFollowRequest(dto: CancelFollowRequestDTO, currentUserId: string) {
        // Find the friend request sent by current user
        const friendRequest = await this.prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: currentUserId,
                    receiverId: dto.receiverId,
                }
            }
        });

        if (!friendRequest) {
            throw new NotFoundException('Friend request not found');
        }

        // Delete the friend request
        await this.prisma.friendRequest.delete({
            where: {
                senderId_receiverId: {
                    senderId: currentUserId,
                    receiverId: dto.receiverId,
                }
            }
        });

        return { message: 'Friend request cancelled successfully' };
    }

    async unfollowUser(dto: UnfollowUserDTO, currentUserId: string) {
        // Find the friendship (could be in either direction due to sorted storage)
        const friendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { friend_a_id: currentUserId, friend_b_id: dto.userId },
                    { friend_a_id: dto.userId, friend_b_id: currentUserId }
                ]
            }
        });

        if (!friendship) {
            throw new NotFoundException('Friendship not found');
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.friendship.delete({
                where: {
                    id: friendship.id
                }
            });

             await tx.user.update({ where: { id: currentUserId }, data: { friendCount: { decrement: 1 } } });
             await tx.user.update({ where: { id: dto.userId }, data: { friendCount: { decrement: 1 } } });

        })


        return { message: 'Unfollowed successfully' };
    }

    // async unFollowUser(followDto: UnFollowUserDTO, id: string) {
        // check if a request alredy exists

        // delete the rquest
        // const res =  await this.prisma.friendRequest.delete({
        //     where: {
        //         senderId: id,
        //         receiverId: followDto.id,
        //     }
        //
        // });

        // const res = await this.prisma.friendRequest.delete({
        //     where: {
        //         senderId: id
        //     }
        //
        //
        // })
    // }


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
                friendCount: true,
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