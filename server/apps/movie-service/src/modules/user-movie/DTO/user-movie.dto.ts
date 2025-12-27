import { IsEnum, IsNumber, IsOptional, Min, Max, IsInt } from 'class-validator';

export enum MovieStatus {
    WATCHED = 'WATCHED',
    PLANNED = 'PLANNED',
}

export class MarkMovieDto {
    @IsNumber()
    movieId: number;

    @IsEnum(MovieStatus)
    status: MovieStatus;
}

export class RemoveMovieDto {
    @IsNumber()
    movieId: number;
}

export class RateMovieDto {
    @IsNumber()
    movieId: number;

    @IsInt({ message: 'Rating must be an integer' })
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(10, { message: 'Rating must be at most 10' })
    rating: number;

    @IsOptional()
    description?: string;
}

