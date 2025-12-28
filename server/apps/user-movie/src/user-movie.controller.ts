import {Controller, Get, HttpStatus} from '@nestjs/common';
import { UserMovieService } from './user-movie.service';

@Controller()
export class UserMovieController {
  constructor(private readonly userMovieService: UserMovieService) {}

  @Get('health')
  healthCheck() {
      return this.userMovieService.healthCheck();
  }

}
