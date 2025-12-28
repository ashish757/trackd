import { Controller, Get } from '@nestjs/common';
import { MovieAppService } from './movie-app.service';

@Controller()
export class MovieAppController {
  constructor(private readonly movieServiceService: MovieAppService) {}

  @Get('health')
  healthCheck() {
    return this.movieServiceService.healthCheck();
  }
}
