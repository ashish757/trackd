import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkMovieDto, RemoveMovieDto, MovieStatus } from './DTO/user-movie.dto';

@Injectable()
export class UserMovieService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Mark a movie as WATCHED or PLANNED
     */
    async markMovie(dto: MarkMovieDto, userId: string) {
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
        return await this.prisma.userMovieEntry.create({
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
        const entry = await this.prisma.userMovieEntry.findUnique({
            where: {
                user_id_movie_id: {
                    user_id: userId,
                    movie_id: dto.movieId,
                },
            },
        });

        if (!entry) {
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
}

