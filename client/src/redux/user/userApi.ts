import {apiSlice} from "../apiSlice.ts";
import {API_CONFIG} from "../../config/api.config.ts";

export type User = {
    id: string;
    name: string,
    email?: string,
    username: string,
    createdAt?: string,
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

        getUserById: builder.query<User, string>({
            query: (username) => ({
                url: `users/${username}`,
                method: 'GET',
            }),

            transformResponse: (response: getUserRes): User => {
                return response.data;
            },

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

        }),

        changeUsername: builder.mutation({
            query: (username) => ({
                    url: API_CONFIG.ENDPOINTS.USER.CHANGE_USERNAME,
                    method: 'POST',
                    body: {username},
            })
        }),
    }),

});


export const { useChangeUsernameMutation, useLazySearchUsersQuery, useGetUserQuery, useGetUserByIdQuery } = userApi;
