import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { MarkMovieDto, RemoveMovieDto, MovieStatus, RateMovieDto } from './DTO/user-movie.dto';
import { CustomLoggerService } from '@app/common';

@Injectable()
export class UserMovieService {
    private readonly logger: CustomLoggerService;

    constructor(private readonly prisma: PrismaService) {
        this.logger = new CustomLoggerService();
        this.logger.setContext(UserMovieService.name);
    }

    /**
     * Mark a movie with a specific status (WATCHED, PLANNED, etc.)
     */
    async markMovie(dto: MarkMovieDto, userId: string) {
        this.logger.log(`User ${userId} marking movie ${dto.movieId} as ${dto.status}`);

        // Create movie entry if it doesn't exist (movieId is TMDB ID)
        await this.prisma.movies.upsert({
            where: { id: dto.movieId },
            update: {}, // Do nothing if movie exists
            create: { id: dto.movieId }, // Create with TMDB ID
        });

        // Upsert the user movie entry (unified model)
        const userMovie = await this.prisma.userMovie.upsert({
            where: {
                userId_movieId: {
                    userId: userId,
                    movieId: dto.movieId,
                },
            },
            update: {
                status: dto.status,
            },
            create: {
                userId: userId,
                movieId: dto.movieId,
                status: dto.status,
            },
        });

        this.logger.debug(`User movie entry ${userMovie.id} updated/created for user ${userId}, movie ${dto.movieId}`);
        return userMovie;
    }

    /**
     * Remove a movie entry (unmark)
     */
    async removeMovie(dto: RemoveMovieDto, userId: string) {
        this.logger.log(`User ${userId} removing movie ${dto.movieId}`);

        const entry = await this.prisma.userMovie.findUnique({
            where: {
                userId_movieId: {
                    userId: userId,
                    movieId: dto.movieId,
                },
            },
        });

        if (!entry) {
            this.logger.debug(`Movie entry not found for user ${userId}, movie ${dto.movieId}`);
            throw new NotFoundException('Movie entry not found');
        }

        await this.prisma.userMovie.delete({
            where: {
                userId_movieId: {
                    userId: userId,
                    movieId: dto.movieId,
                },
            },
        });

        this.logger.log(`Movie entry removed successfully for user ${userId}, movie ${dto.movieId}`);
        return { message: 'Movie entry removed successfully' };
    }

    /**
     * Get all movies for a user
     */
    async getUserMovies(userId: string) {
        return this.prisma.userMovie.findMany({
            where: { userId: userId },
            include: {
                movie: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get movies by status
     */
    async getUserMoviesByStatus(userId: string, status: MovieStatus) {
        return this.prisma.userMovie.findMany({
            where: {
                userId: userId,
                status: status,
            },
            include: {
                movie: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get a specific movie entry
     */
    async getMovieEntry(userId: string, movieId: number) {
        return this.prisma.userMovie.findUnique({
            where: {
                userId_movieId: {
                    userId: userId,
                    movieId: movieId,
                },
            },
            include: {
                movie: true,
            },
        });
    }

    /**
     * Get stats for user movies
     */
    async getUserStats(userId: string) {
        const [watchedCount, plannedCount, watchingCount, droppedCount, onHoldCount, total] = await Promise.all([
            this.prisma.userMovie.count({
                where: { userId: userId, status: MovieStatus.WATCHED },
            }),
            this.prisma.userMovie.count({
                where: { userId: userId, status: MovieStatus.PLANNED },
            }),
            this.prisma.userMovie.count({
                where: { userId: userId, status: MovieStatus.WATCHING },
            }),
            this.prisma.userMovie.count({
                where: { userId: userId, status: MovieStatus.DROPPED },
            }),
            this.prisma.userMovie.count({
                where: { userId: userId, status: MovieStatus.ON_HOLD },
            }),
            this.prisma.userMovie.count({
                where: { userId: userId },
            }),
        ]);

        return {
            watched: watchedCount,
            planned: plannedCount,
            watching: watchingCount,
            dropped: droppedCount,
            onHold: onHoldCount,
            total,
        };
    }

    /**
     * Rate a movie (1-10 scale)
     */
    async rateMovie(dto: RateMovieDto, userId: string) {
        this.logger.log(`User ${userId} rating movie ${dto.movieId} with ${dto.rating}/10`);

        // Validate rating is between 1 and 10
        if (dto.rating < 1 || dto.rating > 10) {
            this.logger.debug(`Invalid rating ${dto.rating} provided by user ${userId}`);
            throw new BadRequestException('Rating must be between 1 and 10');
        }

        // Ensure movie exists in movies table
        await this.prisma.movies.upsert({
            where: { id: dto.movieId },
            update: {},
            create: { id: dto.movieId },
        });

        // Upsert UserMovie with rating (unified model)
        const userMovie = await this.prisma.userMovie.upsert({
            where: {
                userId_movieId: {
                    userId: userId,
                    movieId: dto.movieId,
                },
            },
            update: {
                rating: dto.rating,
                review: dto.description,
            },
            create: {
                userId: userId,
                movieId: dto.movieId,
                rating: dto.rating,
                review: dto.description,
                status: MovieStatus.WATCHED, // Default to WATCHED when rating
            },
        });

        return userMovie;
    }

    /**
     * Get user's rating for a specific movie
     */
    async getUserMovieRating(userId: string, movieId: number) {
        return await this.prisma.userMovie.findUnique({
            where: {
                userId_movieId: {
                    userId: userId,
                    movieId: movieId,
                },
            },
        });
    }

    /**
     * Remove user's rating for a movie (keeps the movie entry)
     */
    async removeRating(movieId: number, userId: string) {
        this.logger.log(`User ${userId} removing rating for movie ${movieId}`);

        const userMovie = await this.prisma.userMovie.findUnique({
            where: {
                userId_movieId: {
                    userId: userId,
                    movieId: movieId,
                },
            },
        });

        if (!userMovie) {
            this.logger.debug(`Movie entry not found for user ${userId}, movie ${movieId}`);
            throw new NotFoundException('Movie entry not found');
        }

        if (!userMovie.rating) {
            this.logger.debug(`No rating found for user ${userId}, movie ${movieId}`);
            throw new NotFoundException('Movie rating not found');
        }

        // Update to remove rating and review, but keep the entry
        await this.prisma.userMovie.update({
            where: {
                userId_movieId: {
                    userId: userId,
                    movieId: movieId,
                },
            },
            data: {
                rating: null,
                review: null,
            },
        });

        this.logger.log(`Rating removed successfully for user ${userId}, movie ${movieId}`);
        return { message: 'Rating removed successfully' };
    }
}

