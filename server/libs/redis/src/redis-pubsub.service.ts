import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { CustomLoggerService } from '@app/common';

export enum NotificationType {
    FRIEND_REQUEST = 'FRIEND_REQUEST',
    FRIEND_REQUEST_ACCEPTED = 'FRIEND_REQUEST_ACCEPTED',
    FRIEND_REQUEST_REJECTED = 'FRIEND_REQUEST_REJECTED',
    MOVIE_RECOMMENDATION = 'MOVIE_RECOMMENDATION',
}
export interface NotificationEvent {
    type: NotificationType;
    userId: string;
    senderId?: string;
    message: string;
    timestamp?: Date;
}

@Injectable()
export class RedisPubSubService implements OnModuleDestroy {
    private readonly pub: Redis;
    private readonly sub: Redis;
    private readonly logger: CustomLoggerService;

    // Channel names
    public static readonly CHANNELS = {
        NOTIFICATIONS: 'notifications',
    };

    constructor() {
        this.logger = new CustomLoggerService();
        this.logger.setContext(RedisPubSubService.name);

        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            retryStrategy: (times: number) => {
                if (times > 3) {
                    this.logger.error('Redis PubSub connection failed after 3 attempts');
                    return null;
                }
                return Math.min(times * 100, 3000);
            },
        };

        // Create separate clients for pub and sub
        this.pub = new Redis(redisConfig);
        this.sub = new Redis(redisConfig);

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.pub.on('connect', () => {
            this.logger.log('Redis Publisher connected');
        });

        this.pub.on('error', (error) => {
            this.logger.error('Redis Publisher error', error.message);
        });

        this.sub.on('connect', () => {
            this.logger.log('Redis Subscriber connected');
        });

        this.sub.on('error', (error) => {
            this.logger.error('Redis Subscriber error', error.message);
        });
    }

    /**
     * Publish a notification event
     */
    async publishNotification(event: NotificationEvent): Promise<void> {
        try {
            const message = JSON.stringify({
                ...event,
                timestamp: event.timestamp || new Date(),
            });

            await this.pub.publish(
                RedisPubSubService.CHANNELS.NOTIFICATIONS,
                message
            );

            this.logger.debug('Published notification event', {
                type: event.type,
                userId: event.userId,
            });
        } catch (error) {
            this.logger.error('Failed to publish notification', error.message, {
                event,
            });
            // Don't throw - publishing failure shouldn't break the main operation
        }
    }

    /**
     * Subscribe to notification events
     */
    async subscribeToNotifications(
        callback: (event: NotificationEvent) => void | Promise<void>
    ): Promise<void> {
        try {
            await this.sub.subscribe(
                RedisPubSubService.CHANNELS.NOTIFICATIONS
            );

            this.sub.on('message', async (channel, message) => {
                if (channel === RedisPubSubService.CHANNELS.NOTIFICATIONS) {
                    try {
                        const event = JSON.parse(message) as NotificationEvent;
                        this.logger.debug('Received notification event', {
                            type: event.type,
                            userId: event.userId,
                        });
                        await callback(event);
                    } catch (error) {
                        this.logger.error('Error processing notification event', error.message, {
                            message,
                        });
                    }
                }
            });

            this.logger.log('Subscribed to notifications channel');
        } catch (error) {
            this.logger.error('Failed to subscribe to notifications', error.message);
        }
    }

    /**
     * Unsubscribe from all channels
     */
    async unsubscribe(): Promise<void> {
        await this.sub.unsubscribe();
        this.logger.log('Unsubscribed from all channels');
    }

    /**
     * Generic Publish to any channel
     */
    async publish<T>(channel: string, payload: T): Promise<void> {
        try {
            await this.pub.publish(channel, JSON.stringify(payload));
        } catch (error) {
            this.logger.error(`Publish failed on ${channel}`, error.message);
        }
    }

    /**
     * Generic Subscribe to any channel
     */
    async subscribe<T>(channel: string, callback: (data: T) => void | Promise<void>): Promise<void> {
        await this.sub.subscribe(channel);
        this.sub.on('message', async (chan, message) => {
            if (chan === channel) {
                try {
                    const data = JSON.parse(message) as T;
                    await callback(data);
                } catch (error) {
                    this.logger.error(`Subscriber error on ${channel}`, error.message);
                }
            }
        });
        this.logger.log(`Subscribed to channel: ${channel}`);
    }

    async onModuleDestroy() {
        await this.unsubscribe();
        await this.pub.quit();
        await this.sub.quit();
        this.logger.log('Redis PubSub connections closed');
    }
}

