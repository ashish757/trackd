import {apiSlice} from "../apiSlice.ts";
import {API_CONFIG} from "../../config/api.config.ts";

export type User = {
    id: string;
    name: string,
    email?: string,
    bio?: string,
    username: string,
    createdAt?: string,
    relationshipStatus?: 'NONE' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'FOLLOWING' | null,
    friendCount?: number,
    passwordChangedAt: string,
    avatar: string | null,

}

interface UserSearchItem {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
}

interface SearchRes {
    data: Array<UserSearchItem>,
}

interface getUserRes {
    data: User
}

export const userApi = apiSlice.injectEndpoints({

    endpoints: (builder) => ({
        searchUsers: builder.query<Array<UserSearchItem>, string>({
            query: (query) => ({
                url: 'users/search?query=' + query,
                method: 'GET',
            }),

            // Transform the response to match our interface
            transformResponse: (response: SearchRes): Array<UserSearchItem> => {
                return response.data ?? [];
            },
        }),

        followUser: builder.mutation<void, { id: string; username?: string }>({
            query: ({ id }) => ({
                url: 'user/follow',
                method: "POST",
                body: {
                    id: id
                }
            }),
            invalidatesTags: (_result, _error, { id, username }) => {
                const tags: Array<{ type: 'User'; id: string }> = [
                    { type: 'User' as const, id },
                ];
                if (username) {
                    tags.push({ type: 'User' as const, id: username });
                }
                console.log('Invalidating tags:', tags);
                return tags;
            }
        }),

        unfollowUser: builder.mutation<void, { userId: string; username?: string }>({
            query: ({ userId }) => ({
                url: 'user/unfollow',
                method: "POST",
                body: {
                    userId: userId
                }
            }),
            invalidatesTags: (_result, _error, { userId, username }) => {
                const tags: Array<{ type: 'User'; id: string }> = [
                    { type: 'User' as const, id: userId },
                ];
                if (username) {
                    tags.push({ type: 'User' as const, id: username });
                }
                return tags;
            }
        }),

        cancelFollowRequest: builder.mutation<void, { receiverId: string; username?: string }>({
            query: ({ receiverId }) => ({
                url: 'user/follow/cancel',
                method: "POST",
                body: {
                    receiverId: receiverId
                }
            }),
            invalidatesTags: (_result, _error, { receiverId, username }) => {
                const tags: Array<{ type: 'User'; id: string }> = [
                    { type: 'User' as const, id: receiverId },
                ];
                if (username) {
                    tags.push({ type: 'User' as const, id: username });
                }
                return tags;
            }
        }),

        acceptFollowRequest: builder.mutation<void, { requesterId: string; username?: string }>({
            query: ({ requesterId }) => ({
                url: 'user/follow/accept',
                method: "POST",
                body: {
                    requesterId: requesterId
                }
            }),
            invalidatesTags: (_result, _error, { requesterId, username }) => {
                const tags: Array<{ type: 'User'; id: string }> = [
                    { type: 'User' as const, id: requesterId },
                ];
                if (username) {
                    tags.push({ type: 'User' as const, id: username });
                }
                return tags;
            }
        }),

        rejectFollowRequest: builder.mutation<void, { requesterId: string; username?: string }>({
            query: ({ requesterId }) => ({
                url: 'user/follow/reject',
                method: "POST",
                body: {
                    requesterId: requesterId
                }
            }),
            invalidatesTags: (_result, _error, { requesterId, username }) => {
                const tags: Array<{ type: 'User'; id: string }> = [
                    { type: 'User' as const, id: requesterId },
                ];
                if (username) {
                    tags.push({ type: 'User' as const, id: username });
                }
                return tags;
            }
        }),


        getUserById: builder.query<User, string>({
            query: (username) => {
                return {
                    url: `users/${username}`,
                    method: 'GET',
                };
            },

            transformResponse: (response: getUserRes): User => {
                return response.data;
            }
        }),

        getUser: builder.query<User, void>({
            query: () => ({
                url: 'user',
                method: 'GET',
            }),

            transformResponse: (response: getUserRes): User => {
                console.log("FETCHED USER")
                return response.data;
            }
        }),

        changeUsername: builder.mutation({
            query: (username) => ({
                    url: API_CONFIG.ENDPOINTS.USER.CHANGE_USERNAME,
                    method: 'POST',
                    body: {username},
            }),

            invalidatesTags: () => {
                // Invalidate the current user query to refetch with new username
                return [
                    { type: 'User' as const, id: 'CURRENT_USER' }
                ];
            }

        }),

        changeName: builder.mutation({
           query: (name)=> ({
               url: API_CONFIG.ENDPOINTS.USER.CHANGE_NAME,
               method: 'POST',
               body: {name},
           }),

            invalidatesTags: () => {
                // Invalidate the current user query to refetch with new username
                return [
                    { type: 'User' as const, id: 'CURRENT_USER' }
                ];
            }

        }),

        changeBio: builder.mutation({
            query: (bio)=> ({
                url: API_CONFIG.ENDPOINTS.USER.CHANGE_BIO,
                method: 'POST',
                body: {bio},
            }),

            invalidatesTags: () => {
                // Invalidate the current user query to refetch with new username
                return [
                    { type: 'User' as const, id: 'CURRENT_USER' }
                ];
            }

        }),

        changePassword: builder.mutation<{ data: {accessToken: string} }, { currentPassword: string; newPassword: string }>({
            query: ({currentPassword, newPassword}) => ({
                url: API_CONFIG.ENDPOINTS.USER.CHANGE_PASSWORD,
                method: 'POST',
                body: {currentPassword, newPassword},
            }),
        }),

        getUserFriendList: builder.query<Array<User>, string>({
            query: (userId) => ({
                url: `friend/list/${userId}`,
                method: 'GET',
            }),
            transformResponse: (response: { data: Array<User> }) => {
                return response.data;
            }
        }),

        getUserMovieStats: builder.query<{
            stats: { watched: number; planned: number; total: number };
            watchedMovies: Array<{ id: string; movie_id: number; status: string; createdAt: string; movie: { id: number } }>;
            plannedMovies: Array<{ id: string; movie_id: number; status: string; createdAt: string; movie: { id: number } }>;
        }, string>({
            query: (userId) => ({
                url: `friend/movies/${userId}`,
                method: 'GET',
            }),
            transformResponse: (response: {
                data: {
                    stats: { watched: number; planned: number; total: number };
                    watchedMovies: Array<{ id: string; movie_id: number; status: string; createdAt: string; movie: { id: number } }>;
                    plannedMovies: Array<{ id: string; movie_id: number; status: string; createdAt: string; movie: { id: number } }>;
                }
            }) => {
                return response.data;
            }
        })

    }),

});


export const {
    useChangeUsernameMutation,
    useChangeBioMutation,
    useChangeNameMutation,
    useChangePasswordMutation,
    useLazySearchUsersQuery,
    useGetUserQuery,
    useGetUserByIdQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useCancelFollowRequestMutation,
    useAcceptFollowRequestMutation,
    useRejectFollowRequestMutation,
    useGetUserFriendListQuery,
    useGetUserMovieStatsQuery
} = userApi;
