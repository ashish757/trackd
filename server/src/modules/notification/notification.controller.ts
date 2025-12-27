import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Req,
    UseGuards,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    /**
     * Get all notifications for the current user
     * GET /notifications?includeRead=true
     */
    @Get()
    async getNotifications(
        @Req() req: Request & { user?: { sub: string; email: string } },
        @Query('includeRead') includeRead?: string,
    ) {
        const userId = req.user.sub;
        const includeReadBool = includeRead === 'true';

        const notifications = await this.notificationService.getUserNotifications(
            userId,
            includeReadBool,
        );

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Notifications fetched successfully',
            data: notifications,
        };
    }

    /**
     * Get unread notification count
     * GET /notifications/unread-count
     */
    @Get('unread-count')
    async getUnreadCount(
        @Req() req: Request & { user?: { sub: string; email: string } },
    ) {
        const userId = req.user.sub;
        const count = await this.notificationService.getUnreadCount(userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Unread count fetched successfully',
            data: { count },
        };
    }

    /**
     * Mark a notification as read
     * PATCH /notifications/:id/read
     */
    @Patch(':id/read')
    async markAsRead(
        @Param('id') notificationId: string,
        @Req() req: Request & { user?: { sub: string; email: string } },
    ) {
        const userId = req.user.sub;
        const notification = await this.notificationService.markAsRead(
            notificationId,
            userId,
        );

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Notification marked as read',
            data: notification,
        };
    }

    /**
     * Mark all notifications as read
     * PATCH /notifications/read-all
     */
    @Patch('read-all')
    async markAllAsRead(
        @Req() req: Request & { user?: { sub: string; email: string } },
    ) {
        const userId = req.user.sub;
        await this.notificationService.markAllAsRead(userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'All notifications marked as read',
        };
    }

    /**
     * Delete a notification
     * DELETE /notifications/:id
     */
    @Delete(':id')
    async deleteNotification(
        @Param('id') notificationId: string,
        @Req() req: Request & { user?: { sub: string; email: string } },
    ) {
        const userId = req.user.sub;
        await this.notificationService.deleteNotification(notificationId, userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Notification deleted',
        };
    }

    /**
     * Delete all read notifications
     * DELETE /notifications/read
     */
    @Delete('read/all')
    async deleteAllRead(
        @Req() req: Request & { user?: { sub: string; email: string } },
    ) {
        const userId = req.user.sub;
        await this.notificationService.deleteAllRead(userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'All read notifications deleted',
        };
    }
}

