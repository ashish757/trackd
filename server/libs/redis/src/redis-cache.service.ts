import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { CustomLoggerService } from '@app/common';
import Redis from 'ioredis';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
    private readonly client: Redis;
    private readonly logger: CustomLoggerService;
    private isConnected = false;
    private hasLoggedError = false;

    constructor() {
        this.logger = new CustomLoggerService();
        this.logger.setContext(RedisCacheService.name);

        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            retryStrategy: (times) => {
                // Retry connection with exponential backoff
                if (times > 3) {
                    // Stop retrying after 3 attempts
                    this.logger.error('Redis connection failed after 3 attempts. Stopping retries.');
                    return null; // Stop retrying
                }
                const delay = Math.min(times * 1000, 3000);
                return delay;
            },
            maxRetriesPerRequest: 2,
            enableReadyCheck: true,
            lazyConnect: false,
        });

        this.client.on('connect', () => {
            this.isConnected = true;
            this.hasLoggedError = false;
            this.logger.log('Redis connected successfully');
        });

        this.client.on('ready', () => {
            this.isConnected = true;
            this.hasLoggedError = false;
            this.logger.log('Redis is ready to accept commands');
        });

        this.client.on('error', (error) => {
            this.isConnected = false;
            // Only log error once to avoid spam
            if (!this.hasLoggedError) {
                this.logger.error('Redis connection error. Token blacklisting will be disabled.', error.message);
                this.logger.warn('Make sure Redis is running: redis-server or docker-compose up redis');
                this.hasLoggedError = true;
            }
        });

        this.client.on('close', () => {
            this.isConnected = false;
            this.logger.warn('Redis connection closed');
        });

        this.client.on('reconnecting', () => {
            this.logger.log('Attempting to reconnect to Redis...');
        });
    }

    async blacklistToken(token: string): Promise<void> {
        // Check if Redis is connected
        if (!this.isConnected) {
            this.logger.warn('Redis not connected. Token blacklisting skipped (token will expire naturally).');
            return;
        }

        try {
            const decoded = jwt.decode(token) as { exp?: number };

            if (!decoded || !decoded.exp) {
                this.logger.warn('Token has no expiration, using default TTL of 15 minutes');
                await this.client.set(`blacklist:${token}`, 'true', 'EX', 900); // 15 min default
                return;
            }

            // Calculate remaining TTL (time until token expires)
            const currentTime = Math.floor(Date.now() / 1000);
            const ttlSeconds = decoded.exp - currentTime;

            if (ttlSeconds > 0) {
                await this.client.set(`blacklist:${token}`, 'true', 'EX', ttlSeconds);
                this.logger.debug(`Token blacklisted with TTL: ${ttlSeconds}s`);
            } else {
                this.logger.debug('Token already expired, skipping blacklist');
            }
        } catch (error) {
            this.logger.error('Error blacklisting token:', error.message);
            // Don't throw - allow logout to continue even if Redis fails
        }
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        // Check if Redis is connected
        if (!this.isConnected) {
            // Silently return false - token verification will continue with JWT validation
            return false;
        }

        try {
            const res = await this.client.get(`blacklist:${token}`);
            return res === 'true';
        } catch (error) {
            this.logger.error('Error checking token blacklist:', error.message);
            // On error, assume token is not blacklisted to avoid blocking valid requests
            return false;
        }
    }

    /**
     * Generic set method for caching objects
     * @param key Redis key
     * @param value Data to store (will be stringified)
     * @param ttl Time to live in seconds
     */
    async set(key: string, value: any, ttl: number): Promise<void> {
        if (!this.isConnected) return;
        try {
            const stringValue = JSON.stringify(value);
            await this.client.set(key, stringValue, 'EX', ttl);
        } catch (error) {
            this.logger.error(`Error setting cache for ${key}:`, error.message);
        }
    }

    /**
     * Generic get method for cached objects
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.isConnected) return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            this.logger.error(`Error getting cache for ${key}:`, error.message);
            return null;
        }
    }


    onModuleDestroy() {
        this.logger.log('Closing Redis connection');
        this.client.quit();
    }
}