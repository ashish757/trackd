import {IsNotEmpty, IsString} from "class-validator";

export class FollowUserDTO {
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

export class ChangePasswordDTO {
    @IsString() @IsNotEmpty() currentPassword: string;
    @IsString() @IsNotEmpty() newPassword: string;
}


export class ChangeUsernameDTO {
    @IsString() @IsNotEmpty() username: string;
}

export class ChangeNameDTO {
    @IsString() @IsNotEmpty() name: string;
}

export class ChangeBioDTO {
    @IsString() @IsNotEmpty() bio: string;
}