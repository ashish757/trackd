import {Injectable, ForbiddenException} from "@nestjs/common";
import {FriendRequestDto} from "./DTO/friend.dto";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export default class FriendService {
    constructor(private  readonly prisma: PrismaService) {}

    createFriendReq(requestBody: FriendRequestDto) {
        // Logic to create a friend request
        const res = this.prisma.friendRequest.create({
            data: {
                senderId: requestBody.senderId,
                receiverId: requestBody.receiverId,
            },
        });

        return {message: `Friend request sent from ${requestBody.senderId} to ${requestBody.receiverId}`};
    }

    async getFriendRequests(id: string) {

        return this.prisma.friendRequest.findMany({
            where: { receiverId: id },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    }

                },

            }
        })

    }

    /**
     * Get friend list of a user (only accessible if requester is a friend)
     */
    async getUserFriendList(targetUserId: string, requesterId: string) {
        const areFriends = await this.checkIfFriends(requesterId, targetUserId);

        if (!areFriends) {
            throw new ForbiddenException('You must be friends to view this user\'s friend list');
        }

        // Get all friendships where target user is involved
        const friendships = await this.prisma.friendship.findMany({
            where: {
                OR: [
                    { friend_a_id: targetUserId },
                    { friend_b_id: targetUserId }
                ]
            },
            include: {
                friendA: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        friendCount: true,
                    }
                },
                friendB: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        friendCount: true,
                    }
                }
            }
        });

        // Extract the friend (not the target user)
        const friends = friendships.map(friendship => {
            if (friendship.friend_a_id === targetUserId) {
                return friendship.friendB;
            } else {
                return friendship.friendA;
            }
        });

        return friends;
    }

    /**
     * Get user's movie statistics (only accessible if requester is a friend)
     */
    async getUserMovieStats(targetUserId: string, requesterId: string) {
        // Check if the requester is a friend of the target user
        const areFriends = await this.checkIfFriends(requesterId, targetUserId);

        if (!areFriends) {
            throw new ForbiddenException('You must be friends to view this user\'s movie list');
        }


        // Get watched movies with details
        const watchedMovies = await this.prisma.userMovieEntry.findMany({
            where: {
                user_id: targetUserId,
                status: 'WATCHED'
            },
            select: {
                id: true,
                movie_id: true,
                status: true,
                createdAt: true,
                movie: {
                    select: {
                        id: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get planned movies with details
        const plannedMovies = await this.prisma.userMovieEntry.findMany({
            where: {
                user_id: targetUserId,
                status: 'PLANNED'
            },
            select: {
                id: true,
                movie_id: true,
                status: true,
                createdAt: true,
                movie: {
                    select: {
                        id: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            stats: {
                watched: watchedMovies.length,
                planned: plannedMovies.length,
                total: watchedMovies.length + plannedMovies.length
            },
            watchedMovies,
            plannedMovies
        };
    }

    /**
     * Helper method to check if two users are friends
     */
    private async checkIfFriends(userId1: string, userId2: string): Promise<boolean> {
        const friendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { friend_a_id: userId1, friend_b_id: userId2 },
                    { friend_a_id: userId2, friend_b_id: userId1 }
                ]
            }
        });

        return !!friendship;
    }

    /**
     * Get current user's own friend list (no friendship check needed)
     */
    async getMyFriendList(userId: string) {
        // Get all friendships where current user is involved
        const friendships = await this.prisma.friendship.findMany({
            where: {
                OR: [
                    { friend_a_id: userId },
                    { friend_b_id: userId }
                ]
            },
            include: {
                friendA: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        friendCount: true,
                    }
                },
                friendB: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        friendCount: true,
                    }
                }
            }
        });

        // Extract the friend (not the current user)
        const friends = friendships.map(friendship => {
            if (friendship.friend_a_id === userId) {
                return friendship.friendB;
            } else {
                return friendship.friendA;
            }
        });

        return friends;
    }
}