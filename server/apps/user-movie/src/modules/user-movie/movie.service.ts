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
     * Mark a movie as WATCHED or PLANNED
     */
    async markMovie(dto: MarkMovieDto, userId: string) {
        this.logger.log(`User ${userId} marking movie ${dto.movieId} as ${dto.status}`);

        // Create movie entry if it doesn't exist (movieId is TMDB ID)
        await this.prisma.movies.upsert({
            where: { id: dto.movieId },
            update: {}, // Do nothing if movie exists
            create: { id: dto.movieId }, // Create with TMDB ID
        });

        // Check if entry already exists
        const existingEntry = await this.prisma.userMovieEntry.findUnique({
            where: {
                user_id_movie_id: {
                    user_id: userId,
                    movie_id: dto.movieId,
                },
            },
        });

        if (existingEntry) {
            // Update existing entry
            this.logger.debug(`Updating existing movie entry for user ${userId}, movie ${dto.movieId}`);
            return this.prisma.userMovieEntry.update({
                where: {
                    user_id_movie_id: {
                        user_id: userId,
                        movie_id: dto.movieId,
                    },
                },
                data: {
                    status: dto.status,
                },
            });
        }

        // Create new entry
        this.logger.debug(`Creating new movie entry for user ${userId}, movie ${dto.movieId}`);
        return this.prisma.userMovieEntry.create({
            data: {
                user_id: userId,
                movie_id: dto.movieId,
                status: dto.status,
            },
        });
    }

    /**
     * Remove a movie entry (unmark)
     */
    async removeMovie(dto: RemoveMovieDto, userId: string) {
        this.logger.log(`User ${userId} removing movie ${dto.movieId}`);

        const entry = await this.prisma.userMovieEntry.findUnique({
            where: {
                user_id_movie_id: {
                    user_id: userId,
                    movie_id: dto.movieId,
                },
            },
        });

        if (!entry) {
            this.logger.warn(`Movie entry not found for user ${userId}, movie ${dto.movieId}`);
            throw new NotFoundException('Movie entry not found');
        }

        await this.prisma.userMovieEntry.delete({
            where: {
                user_id_movie_id: {
                    user_id: userId,
                    movie_id: dto.movieId,
                },
            },
        });

        this.logger.log(`Movie entry removed successfully for user ${userId}, movie ${dto.movieId}`);
        return { message: 'Movie entry removed successfully' };
    }

    /**
     * Get all movies for a user (both WATCHED and PLANNED)
     */
    async getUserMovies(userId: string) {
        return this.prisma.userMovieEntry.findMany({
            where: { user_id: userId },
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
        return this.prisma.userMovieEntry.findMany({
            where: {
                user_id: userId,
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
        return this.prisma.userMovieEntry.findUnique({
            where: {
                user_id_movie_id: {
                    user_id: userId,
                    movie_id: movieId,
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
        const [watchedCount, plannedCount, total] = await Promise.all([
            this.prisma.userMovieEntry.count({
                where: { user_id: userId, status: MovieStatus.WATCHED },
            }),
            this.prisma.userMovieEntry.count({
                where: { user_id: userId, status: MovieStatus.PLANNED },
            }),
            this.prisma.userMovieEntry.count({
                where: { user_id: userId },
            }),
        ]);

        return {
            watched: watchedCount,
            planned: plannedCount,
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
            this.logger.warn(`Invalid rating ${dto.rating} provided by user ${userId}`);
            throw new BadRequestException('Rating must be between 1 and 10');
        }

        // Ensure movie exists in movies table
        await this.prisma.movies.upsert({
            where: { id: dto.movieId },
            update: {},
            create: { id: dto.movieId },
        });

        // Upsert UserMovieData for rating
        const movieData = await this.prisma.userMovieData.upsert({
            where: {
                user_id_movie_id: {
                    user_id: userId,
                    movie_id: dto.movieId,
                },
            },
            update: {
                rating: dto.rating,
                description: dto.description,
            },
            create: {
                user_id: userId,
                movie_id: dto.movieId,
                rating: dto.rating,
                description: dto.description,
            },
        });

        return movieData;
    }

    /**
     * Get user's rating for a specific movie
     */
    async getUserMovieRating(userId: string, movieId: number) {
        const movieData = await this.prisma.userMovieData.findUnique({
            where: {
                user_id_movie_id: {
                    user_id: userId,
                    movie_id: movieId,
                },
            },
        });

        return movieData;
    }

    /**
     * Remove user's rating for a movie
     */
    async removeRating(movieId: number, userId: string) {
        this.logger.log(`User ${userId} removing rating for movie ${movieId}`);

        const movieData = await this.prisma.userMovieData.findUnique({
            where: {
                user_id_movie_id: {
                    user_id: userId,
                    movie_id: movieId,
                },
            },
        });

        if (!movieData) {
            this.logger.warn(`Rating not found for user ${userId}, movie ${movieId}`);
            throw new NotFoundException('Movie rating not found');
        }

        await this.prisma.userMovieData.delete({
            where: {
                user_id_movie_id: {
                    user_id: userId,
                    movie_id: movieId,
                },
            },
        });

        this.logger.log(`Rating removed successfully for user ${userId}, movie ${movieId}`);
        return { message: 'Rating removed successfully' };
    }
}
