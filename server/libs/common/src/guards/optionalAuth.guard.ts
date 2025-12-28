import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        // No auth header - allow request but mark as unauthenticated
        if (!authHeader) {
            request.isAuthenticated = false;
            request.user = {};
            return true;
        }

        const token = authHeader.split(' ')[1];

        // No token after 'Bearer ' - allow request but mark as unauthenticated
        if (!token) {
            request.isAuthenticated = false;
            request.user = {};
            return true;
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
