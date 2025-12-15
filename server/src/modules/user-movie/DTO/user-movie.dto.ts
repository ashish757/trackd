import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';

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

    @IsNumber()
    @Min(1)
    @Max(10)
    rating: number;

    @IsOptional()
    description?: string;
}

