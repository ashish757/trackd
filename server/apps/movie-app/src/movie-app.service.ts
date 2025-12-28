import { Injectable } from '@nestjs/common';

@Injectable()
export class MovieAppService {
  health() {
    return {
      name: 'Movie Service!',
      status: "ok",
      statusCode: 200,
      message: "Service is Up and running"
    }
  }
}
