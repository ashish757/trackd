import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '../auth/jwt.service';

@WebSocketGateway({
    cors: {
        origin: [
            'https://trackd-ten.vercel.app',
            'http://localhost:5173',
        ],
        credentials: true,
    },
    namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationGateway.name);
    private userSockets: Map<string, string> = new Map(); // userId -> socketId

    constructor(private readonly jwtService: JwtService) {}

    async handleConnection(client: Socket) {
        try {
            // Extract token from handshake auth or query
            const token = client.handshake.auth.token || client.handshake.query.token;

            if (!token) {
                this.logger.warn(`Connection rejected: No token provided`);
                client.disconnect();
                return;
            }

            // Verify JWT token
            const result = this.jwtService.verify(token as string, 'access');

            if (result.error || !result.payload || !result.payload.sub) {
                this.logger.warn(`Connection rejected: Invalid token`);
                client.disconnect();
                return;
            }

            // Store user's socket connection
            this.userSockets.set(result.payload.sub, client.id);
            client.data.userId = result.payload.sub;

            this.logger.log(`User ${result.payload.sub} connected with socket ${client.id}`);
        } catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            this.userSockets.delete(userId);
            this.logger.log(`User ${userId} disconnected`);
        }
    }

    /**
     * Send notification to a specific user
     */
    sendNotificationToUser(userId: string, notification: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('notification', notification);
            this.logger.log(`Notification sent to user ${userId}`);
        } else {
            this.logger.debug(`User ${userId} is not connected`);
        }
    }

    /**
     * Client requests to mark notification as read
     */
    @SubscribeMessage('markAsRead')
    handleMarkAsRead(
        @ConnectedSocket() client: Socket,
        payload: { notificationId: string }
    ) {
        this.logger.log(`Mark notification ${payload.notificationId} as read by user ${client.data.userId}`);
        // Service will handle the actual marking
        return { success: true };
    }
}

