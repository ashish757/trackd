import {HttpStatus, Injectable} from '@nestjs/common';

@Injectable()
export class MovieAppService {
  healthCheck() {
    return {
      name: 'Movie Service',
      status: 'ok',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      message: 'Movie Service is running',
    };
  }
}
