import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class FriendAppService {
  healthCheck() {
    return {
      name: 'Friend Service',
      status: 'ok',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      message: 'Friend Service is running',
    };
  }
}
