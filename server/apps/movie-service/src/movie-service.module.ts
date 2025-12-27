import { Module } from '@nestjs/common';
import { MovieServiceController } from './movie-service.controller';
import { MovieServiceService } from './movie-service.service';

@Module({
  imports: [],
  controllers: [MovieServiceController],
  providers: [MovieServiceService],
})
export class MovieServiceModule {}
