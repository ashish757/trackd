import {apiSlice} from "../apiSlice.ts";

export type NotificationsT =  Array<{
    createdAt: string;
    senderId: string;
    receiverId: string;
    sender: {
        id: string;
        name: string;
        username: string;
    };
}>;

interface GetFriendReq {
    status: string;
    statusCode: number;
    message: string;
    data: NotificationsT;
}

export type FriendT = {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    friendCount: number;
};

interface GetMyFriendsResponse {
    status: string;
    statusCode: number;
    message: string;
    data: FriendT[];
}

interface GetMutualFriendsResponse {
    status: string;
    statusCode: number;
    message: string;
    data: FriendT[];
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

        getMyFriends: builder.query<FriendT[], void>({
            query: () => ({
                url: '/friend/my-friends',
                method: 'GET',
            }),

            // Transform the response to match our interface
            transformResponse: (response: GetMyFriendsResponse): FriendT[] => {
                return response.data ?? [];
            },
        }),

        getMutualFriends: builder.query<FriendT[], string>({
            query: (userId: string) => ({
                url: `/friend/mutual/${userId}`,
                method: 'GET',
            }),

            // Transform the response to match our interface
            transformResponse: (response: GetMutualFriendsResponse): FriendT[] => {
                return response.data ?? [];
            },
        }),
    }),
});

export const {
    useGetFriendRequestsQuery,
    useGetMyFriendsQuery,
    useGetMutualFriendsQuery
} = friendApi;
