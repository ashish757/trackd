import {apiSlice} from "../apiSlice.ts";

export type NotificationsT =  Array<{
    createdAt: string;
    senderId: string;
    receiverId: string;
    sender: {
        id: string;
        name: string;
    };
}>;

interface GetFriendReq {
    status: string;
    statusCode: number;
    message: string;
    data: NotificationsT;
}

export const friendApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getFriendRequests: builder.query<NotificationsT, void>({
            query: () => ({
                url: '/friend/requests',
                method: 'GET',
            }),

            // Transform the response to match our interface
            transformResponse: (response: GetFriendReq): NotificationsT => {
                return response.data ?? [];
            },
        }),
    }),
});

export const { useGetFriendRequestsQuery } = friendApi;
