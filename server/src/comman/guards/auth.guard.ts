import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '../../modules/auth/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('No Authorization header provided');
        }

        const token = authHeader.split(' ')[1];

        // Simple token check (replace with JWT verification)
        const { payload, error } = this.jwtService.verify(token, 'access');

        if (error) throw new UnauthorizedException('Invalid token');

        request.user = payload; // attach user info
        return true;
    }
}
