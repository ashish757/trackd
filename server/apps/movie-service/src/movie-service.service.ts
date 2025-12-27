import { Injectable } from '@nestjs/common';

@Injectable()
export class MovieServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
