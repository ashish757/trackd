import {IsString} from "class-validator";

export class SearchMovieDTO {
    @IsString() query: string;
}