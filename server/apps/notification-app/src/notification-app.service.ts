import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationAppService {
  getHello(): string {
    return 'Hello World!';
  }
}
