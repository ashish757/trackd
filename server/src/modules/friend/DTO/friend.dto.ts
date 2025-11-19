import {IsString} from "class-validator";

export class FriendRequestDto {
    @IsString() senderId: string;
    @IsString() receiverId: string;
}