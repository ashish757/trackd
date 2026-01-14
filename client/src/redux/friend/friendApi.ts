import {apiSlice} from "../apiSlice.ts";
import { API_CONFIG } from "../../config/api.config.ts";

export type NotificationsT =  Array<{
    createdAt: string;
    senderId: string;
    receiverId: string;
    sender: {
        id: string;
        name: string;
        username: string;
        avatar?: string;
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
                url: API_CONFIG.ENDPOINTS.FRIEND.GET_REQUESTS,
                method: 'GET',
            }),

            // Transform the response to match our interface
            transformResponse: (response: GetFriendReq): NotificationsT => {
                return response.data ?? [];
            },
        }),

        getMyFriends: builder.query<FriendT[], void>({
            query: () => ({
                url: API_CONFIG.ENDPOINTS.FRIEND.GET_MY_FRIENDS,
                method: 'GET',
            }),

            // Transform the response to match our interface
            transformResponse: (response: GetMyFriendsResponse): FriendT[] => {
                return response.data ?? [];
            },
        }),

        getMutualFriends: builder.query<FriendT[], string>({
            query: (userId: string) => ({
                url: `${API_CONFIG.ENDPOINTS.FRIEND.GET_MUTUAL}/${userId}`,
                method: 'GET',
            }),

            // Transform the response to match our interface
            transformResponse: (response: GetMutualFriendsResponse): FriendT[] => {
                return response.data ?? [];
            },
        }),

        recommendMovieToFriends: builder.mutation<void, { movieId: number, receiverId: Array<string> }>({
            query: (data) => ({
                url: API_CONFIG.ENDPOINTS.FRIEND.RECOMMEND_MOVIE,
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetFriendRequestsQuery,
    useRecommendMovieToFriendsMutation,
    useGetMyFriendsQuery,
    useGetMutualFriendsQuery
} = friendApi;
