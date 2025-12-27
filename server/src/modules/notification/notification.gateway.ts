import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
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
    // Changed to support multiple sockets per user (for multiple tabs)
    private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

    constructor(private readonly jwtService: JwtService) {}

    async handleConnection(client: Socket) {
        try {
            // Extract token from handshake auth or query
            const token = client.handshake.auth.token || client.handshake.query.token;

            if (!token) {
                this.logger.warn(`Connection rejected: No token provided`);
                client.emit('error', { code: 'NO_TOKEN', message: 'Authentication required' });
                client.disconnect();
                return;
            }

            // Verify JWT token
            const result = this.jwtService.verify(token as string, 'access');

            if (result.error || !result.payload || !result.payload.sub) {
                this.logger.warn(`Connection rejected: Invalid/expired token - ${result.error}`);

                // Check if error is an object with a name property
                const isTokenExpired = typeof result.error === 'object' &&
                                      result.error !== null &&
                                      'name' in result.error &&
                                      result.error.name === 'TokenExpiredError';

                client.emit('error', {
                    code: isTokenExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
                    message: 'Authentication failed'
                });
                client.disconnect();
                return;
            }

            // Store user's socket connection (support multiple tabs)
            const userId = result.payload.sub;
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId).add(client.id);
            client.data.userId = userId;

            const connectionCount = this.userSockets.get(userId).size;
            this.logger.log(`User ${userId} connected with socket ${client.id} (${connectionCount} active connections)`);
        } catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.emit('error', { code: 'CONNECTION_ERROR', message: error.message });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId && this.userSockets.has(userId)) {
            const userSocketSet = this.userSockets.get(userId);
            userSocketSet.delete(client.id);

            // Remove user from map if no more connections
            if (userSocketSet.size === 0) {
                this.userSockets.delete(userId);
                this.logger.log(`User ${userId} fully disconnected`);
            } else {
                this.logger.log(`User ${userId} disconnected socket ${client.id}. Remaining connections: ${userSocketSet.size}`);
            }
        }
    }

    /**
     * Send notification to a specific user (all their active connections/tabs)
     */
    sendNotificationToUser(userId: string, notification: any) {
        const socketIds = this.userSockets.get(userId);
        if (socketIds && socketIds.size > 0) {
            // Send to ALL user's sockets (all open tabs)
            socketIds.forEach(socketId => {
                this.server.to(socketId).emit('notification', notification);
            });
            this.logger.log(`Notification sent to user ${userId} (${socketIds.size} active connections)`);
        } else {
            this.logger.debug(`User ${userId} is not connected`);
        }
    }
}

