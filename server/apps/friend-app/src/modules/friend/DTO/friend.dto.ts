import {IsNumber, IsString} from "class-validator";

export class FriendRequestDto {
    @IsString() senderId: string;
    @IsString() receiverId: string;
}

export class RecommendMovieDto {
    @IsString() recommenderId: string;
    receiverIds: string[];
    @IsNumber() movieId: number;
}