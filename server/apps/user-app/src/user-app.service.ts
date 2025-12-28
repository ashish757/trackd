import { Injectable } from '@nestjs/common';

@Injectable()
export class UserAppService {
  getHello(): string {
    return 'Hello World!';
  }
}
