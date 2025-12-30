import {
    BadRequestException,
    ConflictException, Injectable, InternalServerErrorException, NotFoundException,
} from "@nestjs/common";
import {PrismaService} from "@app/common/prisma/prisma.service";
import {
    AcceptFollowRequestDTO, CancelFollowRequestDTO, ChangeBioDTO, ChangeNameDTO,
    ChangePasswordDTO, ChangeUsernameDTO, FollowUserDTO, RejectFollowRequestDTO, UnfollowUserDTO
} from "./DTO/user.dto";
import * as bcrypt from 'bcrypt';
import {JwtService} from "@app/common/jwt/jwt.service";
import { PASSWORD_SALT_ROUNDS, CustomLoggerService } from '@app/common';
import { RedisPubSubService } from '@app/redis';

@Injectable()
export class UserService {
    private readonly logger: CustomLoggerService;

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly redisPubSub: RedisPubSubService,
    ) {
        this.logger = new CustomLoggerService();
        this.logger.setContext(UserService.name);
    }

    async followUser(followDto: FollowUserDTO, id: string) {
        this.logger.log(`Follow request: User ${id} wants to follow ${followDto.id}`);

        // Validate user is not trying to follow themselves
        if (id === followDto.id) {
            this.logger.warn(`User ${id} attempted to follow themselves`);
            throw new BadRequestException('You cannot follow yourself');
        }

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
            this.logger.debug(`Friend request already exists: ${id} → ${followDto.id}`);
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
            this.logger.debug(`Users are already friends: ${id} ↔ ${followDto.id}`);
            return { message: 'Already friends' };
        }

        // create a request
        await this.prisma.friendRequest.create({
            data: {
                senderId: id,
                receiverId: followDto.id,
            }
        });

        // Get sender info for notification
        const sender = await this.prisma.user.findUnique({
            where: { id },
            select: { name: true }
        });

        // Publish notification event via Redis
        await this.redisPubSub.publishNotification({
            userId: followDto.id,
            senderId: id,
            type: 'FRIEND_REQUEST',
            message: `${sender?.name || 'Someone'} sent you a friend request`,
        });


        return { message: 'Friend request sent successfully' };
    }

    async acceptFollowRequest(dto: AcceptFollowRequestDTO, currentUserId: string) {
        this.logger.log(`User ${currentUserId} accepting friend request from ${dto.requesterId}`);

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
            this.logger.warn(`Friend request not found: ${dto.requesterId} → ${currentUserId}`);
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

        // Get accepter info for notification
        const accepter = await this.prisma.user.findUnique({
            where: { id: currentUserId },
            select: { name: true }
        });

        // Publish notification event via Redis
        await this.redisPubSub.publishNotification({
            userId: dto.requesterId,
            senderId: currentUserId,
            type: 'FRIEND_REQUEST_ACCEPTED',
            message: `${accepter?.name || 'Someone'} accepted your friend request`,
        });

        this.logger.log(`Friend request accepted: ${dto.requesterId} ↔ ${currentUserId}`);
        return { message: 'Friend request accepted successfully' };
    }

    async rejectFollowRequest(dto: RejectFollowRequestDTO, currentUserId: string) {
        this.logger.log(`User ${currentUserId} rejecting friend request from ${dto.requesterId}`);

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
            this.logger.warn(`Friend request not found: ${dto.requesterId} → ${currentUserId}`);
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

        // Get rejecter info for notification
        const rejecter = await this.prisma.user.findUnique({
            where: { id: currentUserId },
            select: { name: true }
        });

        // Publish notification event via Redis
        await this.redisPubSub.publishNotification({
            userId: dto.requesterId,
            senderId: currentUserId,
            type: 'FRIEND_REQUEST_REJECTED',
            message: `${rejecter?.name || 'Someone'} rejected your friend request`,
        });

        this.logger.log(`Friend request rejected: ${dto.requesterId} ✗ ${currentUserId}`);
        return { message: 'Friend request rejected successfully' };
    }

    async cancelFollowRequest(dto: CancelFollowRequestDTO, currentUserId: string) {
        this.logger.log(`User ${currentUserId} cancelling friend request to ${dto.receiverId}`);

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
            this.logger.warn(`Friend request not found: ${currentUserId} → ${dto.receiverId}`);
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

        this.logger.log(`Friend request cancelled: ${currentUserId} → ${dto.receiverId}`);
        return { message: 'Friend request cancelled successfully' };
    }

    async unfollowUser(dto: UnfollowUserDTO, currentUserId: string) {
        this.logger.log(`User ${currentUserId} unfollowing ${dto.userId}`);

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
            this.logger.warn(`Friendship not found: ${currentUserId} ↔ ${dto.userId}`);
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
        });

        this.logger.log(`Friendship removed: ${currentUserId} ✗ ${dto.userId}`);
        return { message: 'Unfollowed successfully' };
    }

    async getUser(id: string){
        const res = this.prisma.user.findUnique({
            where: {id},
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                createdAt: true,
                friendCount: true,
                passwordChangedAt: true,
                bio: true,
                avatar: true,
            }

            });

        if(!res) throw new NotFoundException('User not found');

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
                bio: true,
                avatar: true,
            }
        });

        if (!user) throw new NotFoundException('User not found');

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
            const user: Array<{
                id: string;
                name: string;
                username: string;
                avatar: string | null;
            }> =  await this.prisma.$queryRaw`
                SELECT id, name, username, avatar FROM users
                WHERE username ILIKE ${'%' + search + '%'} 
                OR name ILIKE ${'%' + search + '%'} 
                ORDER BY 
                    (username ILIKE ${'%' + search + '%'}) DESC,
                    (name ILIKE ${'%' + search + '%'}) DESC; ;
          `;

            return user

        } catch (err) {
            this.logger.error("Database query error:", err);
            throw new InternalServerErrorException('Failed to search users');
        }
    }


    async changePassword(dto: ChangePasswordDTO, userId: string) {
        if (dto.currentPassword === dto.newPassword) {
            throw new BadRequestException('New password cannot be the same as the current password');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) throw new NotFoundException('User not found');

        // compare old password
        const verify = await bcrypt.compare(dto.currentPassword, user.password);
        if (!verify) {
            throw new BadRequestException('Current password is incorrect');
        }

        const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

        // issue a new access token and invalidate all refresh tokens
        // Generate new tokens
        const accessToken = this.jwtService.sign(
            { sub: user.id, email: user.email }, 'access',
            { expiresIn: '15min' },
        );
        const newRefreshToken = this.jwtService.sign(
            { sub: user.id, email: user.email }, 'refresh',
            { expiresIn: '7d' },
        );

        const hashedNewToken = await bcrypt.hash(newRefreshToken, PASSWORD_SALT_ROUNDS);

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: newPasswordHash,
                refreshTokens: [hashedNewToken],
                passwordChangedAt: new Date(),
            }
        });

        if (!updatedUser) throw new InternalServerErrorException('Could not update password');


        // send a mail to user notifying password change

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }


    async changeName(dto: ChangeNameDTO, userId: string) {
        const res = await this.prisma.user.update({
            where: {id: userId},
            data: {name: dto.name},
        })

        if(!res) throw new NotFoundException('User not found');

        return {
            message: 'Name updated successfully',
            name: res.name,
        };
    }

    async changeBio(dto: ChangeBioDTO, userId: string) {
        const res = await this.prisma.user.update({
            where: {id: userId},
            data: {bio: dto.bio},
        })

        if(!res) throw new NotFoundException('User not found');

        return {
            message: 'Name updated successfully',
            name: res.name,
        };
    }

}