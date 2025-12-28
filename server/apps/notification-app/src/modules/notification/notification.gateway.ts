import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@app/common';

@WebSocketGateway({
    cors: {
        path: '/socket.io/',
        origin: [
            'https://trackd-ten.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000', // Allow main server to proxy
        ],
        credentials: true,
    },
    // Remove namespace since we're handling routing via proxy
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
                this.logger.warn(`Connection rejected from ${client.id}: No token provided`);
                client.emit('error', {
                    code: 'NO_TOKEN',
                    message: 'Authentication required'
                });
                client.disconnect(true); // Force disconnect without reconnection
                return;
            }

            // Verify JWT token
            const result = this.jwtService.verify(token as string, 'access');

            if (result.error || !result.payload || !result.payload.sub) {
                const errorType = typeof result.error === 'object' &&
                                 result.error !== null &&
                                 'name' in result.error &&
                                 result.error.name === 'TokenExpiredError'
                                 ? 'TOKEN_EXPIRED'
                                 : 'INVALID_TOKEN';

                this.logger.warn(`Connection rejected from ${client.id}: ${errorType}`);

                client.emit('error', {
                    code: errorType,
                    message: 'Authentication failed'
                });
                client.disconnect(true); // Force disconnect without reconnection
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
            this.logger.log(`User ${userId} CONNECTED with socket ${client.id} (${connectionCount} active connections)`);

            // Send confirmation to client
            client.emit('connected', {
                message: 'Successfully CONNECTED to notification service',
                userId
            });
        } catch (error) {
            this.logger.error(`Connection error for ${client.id}: ${error.message}`);
            client.emit('error', {
                code: 'CONNECTION_ERROR',
                message: 'Internal server error'
            });
            client.disconnect(true);
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
                this.logger.log(`User ${userId}  DISCONNECTED (socket ${client.id})`);
            } else {
                this.logger.log(`User ${userId} DISCONNECTED socket ${client.id}. Remaining connections: ${userSocketSet.size}`);
            }
        } else {
            this.logger.debug(`Socket ${client.id} DISCONNECTED (no user associated)`);
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

