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

        changeUsername: builder.mutation({
            query: (username) => ({
                    url: API_CONFIG.ENDPOINTS.USER.CHANGE_USERNAME,
                    method: 'POST',
                    body: {username},
            })
        }),
    }),

});


export const { useChangeUsernameMutation, useLazySearchUsersQuery } = userApi;
