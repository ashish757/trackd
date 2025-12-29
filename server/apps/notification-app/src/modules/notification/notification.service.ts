import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { CustomLoggerService } from '@app/common';

export interface CreateNotificationDto {
    userId: string;
    senderId?: string;
    type: 'FRIEND_REQUEST' | 'FRIEND_REQUEST_ACCEPTED' | 'FRIEND_REQUEST_REJECTED';
    message: string;
}

@Injectable()
export class NotificationService {
    private readonly logger: CustomLoggerService;

    constructor(private readonly prisma: PrismaService) {
        this.logger = new CustomLoggerService();
        this.logger.setContext(NotificationService.name);
    }

    /**
     * Create a new notification
     */
    async createNotification(data: CreateNotificationDto) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: data.userId,
                    senderId: data.senderId,
                    type: data.type,
                    message: data.message,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
            });

            this.logger.log(`Notification created for user ${data.userId}`);
            return notification;
        } catch (error) {
            this.logger.error(`Failed to create notification: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get all notifications for a user
     */
    async getUserNotifications(userId: string, includeRead = false) {
        const whereClause: any = { userId };

        if (!includeRead) {
            whereClause.isRead = false;
        }

        return this.prisma.notification.findMany({
            where: whereClause,
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string, userId: string) {
        const notification = await this.prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId, // Ensure user owns this notification
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }

    /**
     * Mark multiple notifications as read
     */
    async markMultipleAsRead(notificationIds: string[], userId: string): Promise<number> {
        // Update only notifications that belong to the user
        const result = await this.prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId, // Ensure user owns these notifications
                isRead: false, // Only update unread ones
            },
            data: {
                isRead: true,
            },
        });

        return result.count;
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string, userId: string) {
        const notification = await this.prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        return this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }

    /**
     * Delete all read notifications for a user
     */
    async deleteAllRead(userId: string) {
        return this.prisma.notification.deleteMany({
            where: {
                userId,
                isRead: true,
            },
        });
    }
}

