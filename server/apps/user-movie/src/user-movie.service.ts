import {HttpStatus, Injectable} from '@nestjs/common';

@Injectable()
export class UserMovieService {
    healthCheck() {
        return {
            name: 'User Movie Service!',
            status: 'ok',
            statusCode: HttpStatus.OK,
            message: 'User Movie Service is running',
        };
    }
}
