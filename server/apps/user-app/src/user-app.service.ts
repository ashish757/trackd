import {HttpStatus, Injectable} from '@nestjs/common';

@Injectable()
export class UserAppService {
  healthCheck() {
    return {
        name: 'User Service',
        status: 'ok',
        statusCode: HttpStatus.OK,
        timestamp: new Date().toISOString(),
        message: 'User Service is running',
    }
  }

}
