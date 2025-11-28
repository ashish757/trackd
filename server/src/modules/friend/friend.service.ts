import {Injectable} from "@nestjs/common";
import {FriendRequestDto} from "./DTO/friend.dto";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export default class FriendService {
    constructor(private  readonly prisma: PrismaService) {}

    createFriendReq(requestBody: FriendRequestDto) {
        // Logic to create a friend request
        const res = this.prisma.friendRequest.create({
            data: {
                senderId: requestBody.senderId,
                receiverId: requestBody.receiverId,
            },
        });

        return {message: `Friend request sent from ${requestBody.senderId} to ${requestBody.receiverId}`};
    }

    async getFriendRequests(id: string) {

        return this.prisma.friendRequest.findMany({
            where: { receiverId: id },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    }

                },

            }
        })

    }
}