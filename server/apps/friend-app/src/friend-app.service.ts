import { Injectable } from '@nestjs/common';

@Injectable()
export class FriendAppService {
  getHello(): string {
    return 'Hello World!';
  }
}
