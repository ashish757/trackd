import { Controller, Get } from '@nestjs/common';
import { MovieServiceService } from './movie-service.service';

@Controller()
export class MovieServiceController {
  constructor(private readonly movieServiceService: MovieServiceService) {}

  @Get()
  getHello(): string {
    return this.movieServiceService.getHello();
  }
}
