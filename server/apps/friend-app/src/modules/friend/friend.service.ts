import {ForbiddenException, Injectable} from "@nestjs/common";
import {FriendRequestDto, RecommendMovieDto} from "./DTO/friend.dto";
import {PrismaService} from "@app/common/prisma/prisma.service";
import {CustomLoggerService} from '@app/common';
import {NotificationType, RedisPubSubService} from "@app/redis";

@Injectable()
export default class FriendService {
    private readonly logger: CustomLoggerService;

    constructor(private readonly prisma: PrismaService, private readonly redisPubSub: RedisPubSubService) {
        this.logger = new CustomLoggerService();
        this.logger.setContext(FriendService.name);
    }

    async createFriendReq(requestBody: FriendRequestDto) {
        this.logger.log(`Friend request: ${requestBody.senderId} → ${requestBody.receiverId}`);

        // Logic to create a friend request
        const res = await this.prisma.friendRequest.create({
            data: {
                senderId: requestBody.senderId,
                receiverId: requestBody.receiverId,
            },
        });

        this.logger.log(`Friend request created successfully: ID ${res.id}`);
        return {message: `Friend request sent from ${requestBody.senderId} to ${requestBody.receiverId}`};
    }

    async getFriendRequests(id: string) {
        this.logger.debug(`Fetching friend requests for user: ${id}`);

        const requests = await this.prisma.friendRequest.findMany({
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
        });

        this.logger.debug(`Found ${requests.length} friend requests for user: ${id}`);
        return requests;
    }

    /**
     * Get friend list of a user (only accessible if requester is a friend)
     */
    async getUserFriendList(targetUserId: string, requesterId: string) {
        this.logger.log(`User ${requesterId} requesting friend list of ${targetUserId}`);

        const areFriends = await this.checkIfFriends(requesterId, targetUserId);

        if (!areFriends) {
            this.logger.debug(`Access denied: User ${requesterId} is not friends with ${targetUserId}`);
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
        const watchedMovies = await this.prisma.userMovie.findMany({
            where: {
                userId: targetUserId,
                status: 'WATCHED'
            },
            select: {
                id: true,
                movieId: true,
                status: true,
                rating: true,
                review: true,
                isFavorite: true,
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
        const plannedMovies = await this.prisma.userMovie.findMany({
            where: {
                userId: targetUserId,
                status: 'PLANNED'
            },
            select: {
                id: true,
                movieId: true,
                status: true,
                rating: true,
                review: true,
                isFavorite: true,
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

        // Get favorite movies
        const favoriteMovies = await this.prisma.userMovie.findMany({
            where: {
                userId: targetUserId,
                isFavorite: true
            },
            select: {
                id: true,
                movieId: true,
                status: true,
                rating: true,
                review: true,
                isFavorite: true,
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
                favorites: favoriteMovies.length,
                total: watchedMovies.length + plannedMovies.length
            },
            watchedMovies,
            plannedMovies,
            favoriteMovies
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

    /**
     * Get mutual friends between current user and target user
     * Uses an efficient query with raw SQL for better performance
     */
    async getMutualFriends(currentUserId: string, targetUserId: string) {

        // Efficient query to find mutual friends using raw SQL
        // This finds all user IDs that are friends with BOTH currentUserId and targetUserId
        const mutualFriendIds = await this.prisma.$queryRaw<Array<{ id: string }>>`
            SELECT DISTINCT 
                CASE 
                    WHEN f1.friend_a_id = ${currentUserId} THEN f1.friend_b_id
                    ELSE f1.friend_a_id
                END as id
            FROM "Friendship" f1
            WHERE (f1.friend_a_id = ${currentUserId} OR f1.friend_b_id = ${currentUserId})
            
            INTERSECT
            
            SELECT DISTINCT 
                CASE 
                    WHEN f2.friend_a_id = ${targetUserId} THEN f2.friend_b_id
                    ELSE f2.friend_a_id
                END as id
            FROM "Friendship" f2
            WHERE (f2.friend_a_id = ${targetUserId} OR f2.friend_b_id = ${targetUserId})
        `;

        // If no mutual friends found
        if (mutualFriendIds.length === 0) {
            return [];
        }

        // Fetch full user details for mutual friends
        return  this.prisma.user.findMany({
            where: {
                id: {
                    in: mutualFriendIds.map(mf => mf.id)
                }
            },
            select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                friendCount: true,
            }
        });

    }

    /**
     * Recommend movies to a friend
     */
    async recommendMovieToFriends(dto: RecommendMovieDto, senderId) {

        const { receiverIds, movieId } = dto;
        const recommenderId = senderId;
        const validFriendships = await this.prisma.friendship.findMany({
            where: {
                OR: [
                    {
                        friend_a_id: recommenderId,
                        friend_b_id: { in: receiverIds }
                    },
                    {
                        friend_b_id: recommenderId,
                        friend_a_id: { in: receiverIds }
                    }
                ]
            }
        });

        if (validFriendships.length !== receiverIds.length) {
            this.logger.error(`Validation failed: Some users in the list are not friends with ${recommenderId}`);
            throw new ForbiddenException('You can only recommend movies to confirmed friends.');
        }

        // 3. Prepare data for insertion
        const recommendationData = receiverIds.map((id) => ({
            recommenderId,
            receiverId: id,
            movieId,
        }));

        // Database Operation & Notifications
        // Using a transaction ensures both the DB records and notifications are handled
        return this.prisma.$transaction(async (tx) => {

            // Creating all
            await tx.movieRecommendation.createMany({
                data: recommendationData,
                skipDuplicates: true, // Useful if the unique constraint (recommender-receiver-movie) is triggered
            });

            // Send Notifications
            const notificationPromises = dto.receiverIds.map(id =>
                this.redisPubSub.publishNotification({
                    userId: id,
                    senderId: recommenderId,
                    type: NotificationType.MOVIE_RECOMMENDATION,
                    message: `${recommenderId} Sent you a movie recommendation!`,
                })
            );

            await Promise.all(notificationPromises);

            return {
                message: `Successfully recommended movie to ${dto.receiverIds.length} friends`,
                count: dto.receiverIds.length
            };
        });


    }
}