import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Optional,
    Logger, Inject,
} from '@nestjs/common';
import { JwtService, } from '../jwt/jwt.service';
import type {IRedisService} from "../interfaces/redis.interface";


@Injectable()
export class OptionalAuthGuard implements CanActivate {
    private readonly logger = new Logger(OptionalAuthGuard.name);

    constructor(
        private readonly jwtService: JwtService,
        @Optional() @Inject('RedisService') private readonly redisService?: IRedisService,
    ) {}

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            request.isAuthenticated = false;
            request.user = {};
            return true;
        }

        const token = authHeader.split(' ')[1];

        // Check if token is blacklisted (if Redis service is available)
        if (this.redisService) {
            try {
                const isBlacklisted = await this.redisService.isTokenBlacklisted(token);
                if (isBlacklisted) {
                    this.logger.warn('Attempted use of blacklisted token');
                    request.isAuthenticated = false;
                    request.user = {};
                    return true;
                }
            } catch (error) {
                this.logger.error('Error checking token blacklist:', error);
                // Continue with verification if Redis check fails
            }
        }

        const { payload, error } = this.jwtService.verify(token, 'access');

        if (error) {
            request.isAuthenticated = false;
            request.user = {};
            return true;
        }

        request.isAuthenticated = true;
        request.user = payload;
        return true;
    }
}
