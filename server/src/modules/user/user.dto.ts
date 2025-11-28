import {IsNotEmpty, IsString} from "class-validator";

export class ChangeUsernameDTO {
    @IsString() @IsNotEmpty() username: string;
}

export class FollowUserDTO {
    @IsString() @IsNotEmpty() id: string;
}

export class UnFollowUserDTO {
    @IsString() @IsNotEmpty() id: string;
}

export class AcceptFollowRequestDTO {
    @IsString() @IsNotEmpty() requesterId: string;
}

export class RejectFollowRequestDTO {
    @IsString() @IsNotEmpty() requesterId: string;
}

export class CancelFollowRequestDTO {
    @IsString() @IsNotEmpty() receiverId: string;
}

export class UnfollowUserDTO {
    @IsString() @IsNotEmpty() userId: string;
}

