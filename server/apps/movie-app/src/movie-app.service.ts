import {HttpStatus, Injectable} from '@nestjs/common';

@Injectable()
export class MovieAppService {
  health() {
    return {
      name: 'Movie Service!',
      status: "ok",
      statusCode: HttpStatus.OK,
      message: "Movie Service is  running"
    }
  }
}
