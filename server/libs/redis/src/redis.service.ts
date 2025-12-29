import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
        });

        this.client.on('connect', () => {
            this.logger.log('Redis connected successfully');
        });

        this.client.on('error', (error) => {
            this.logger.error('Redis connection error:', error);
        });
    }

    async blacklistToken(token: string): Promise<void> {
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
            this.logger.error('Error blacklisting token:', error);
            throw error;
        }
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        try {
            const res = await this.client.get(`blacklist:${token}`);
            return res === 'true';
        } catch (error) {
            this.logger.error('Error checking token blacklist:', error);
            // On error, assume token is not blacklisted to avoid blocking valid requests
            return false;
        }
    }

    onModuleDestroy() {
        this.logger.log('Closing Redis connection');
        this.client.quit();
    }
}