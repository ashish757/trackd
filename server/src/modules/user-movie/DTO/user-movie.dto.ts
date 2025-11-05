import { IsEnum, IsNumber } from 'class-validator';

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

