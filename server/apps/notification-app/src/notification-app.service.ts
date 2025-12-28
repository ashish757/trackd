import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class NotificationAppService {
  healthCheck() {
    return {
      name: 'Notification Service',
      status: 'ok',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      message: 'Notification Service is running',
    };
  }
}
