import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Optional,
    Logger,
} from '@nestjs/common';
import { JwtService, type IRedisService } from '@app/common';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    constructor(
        private readonly jwtService: JwtService,
        @Optional() private readonly redisService?: IRedisService,
    ) {}

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('No Authorization header provided');
        }

        const token = authHeader.split(' ')[1];

        // Check if token is blacklisted (if Redis service is available)
        if (this.redisService) {
            try {
                const isBlacklisted = await this.redisService.isTokenBlacklisted(token);
                if (isBlacklisted) {
                    this.logger.warn('Attempted use of blacklisted token');
                    throw new UnauthorizedException();
                }
            } catch (error) {
                if (error instanceof UnauthorizedException) {
                    throw new UnauthorizedException('Token has been revoked');;
                }
                this.logger.error('Error checking token blacklist:', error);
                // Continue with verification if Redis check fails
            }
        }

        // Verify token
        const { payload, error } = this.jwtService.verify(token, 'access');

        if (error) throw new UnauthorizedException('Invalid token');

        request.user = payload; // attach user info
        return true;
    }
}
