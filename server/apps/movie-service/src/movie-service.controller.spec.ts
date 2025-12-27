import { Test, TestingModule } from '@nestjs/testing';
import { MovieServiceController } from './movie-service.controller';
import { MovieServiceService } from './movie-service.service';

describe('MovieServiceController', () => {
  let movieServiceController: MovieServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MovieServiceController],
      providers: [MovieServiceService],
    }).compile();

    movieServiceController = app.get<MovieServiceController>(MovieServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(movieServiceController.getHello()).toBe('Hello World!');
    });
  });
});
