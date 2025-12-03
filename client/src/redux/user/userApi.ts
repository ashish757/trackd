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
    passwordChangedAt: string
}

interface SearchRes {
    data: Array<User>,
}

interface getUserRes {
    data: User
}

export const userApi = apiSlice.injectEndpoints({

    endpoints: (builder) => ({
        searchUsers: builder.query<Array<User>, string>({
            query: (query) => ({
                url: 'users/search?query=' + query,
                method: 'GET',
            }),

            // Transform the response to match our interface
            transformResponse: (response: SearchRes): Array<User> => {
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
            },

            providesTags: (result, _, username) => {
                const tags = result ? [
                    { type: 'User' as const, id: result.id },
                    { type: 'User' as const, id: username }
                ] : [];
                return tags;
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
            },

            providesTags: (result) => {
                const tags: Array<{ type: 'User'; id: string }> = [
                    { type: 'User' as const, id: 'CURRENT_USER' }
                ];
                if (result) {
                    tags.push(
                        { type: 'User' as const, id: result.id },
                        { type: 'User' as const, id: result.username }
                    );
                }
                return tags;
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
    useRejectFollowRequestMutation
} = userApi;
