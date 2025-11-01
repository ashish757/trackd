import {apiSlice} from "../apiSlice.ts";

export const authApi = apiSlice.injectEndpoints({


    endpoints: (builder) => ({
        users: builder.query({
            query: (id)=> `/users/${id}`,
        }),
    }),

});

// Auto-generated hooks for your components
export const { useUsersQuery } = authApi;
