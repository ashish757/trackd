import {apiSlice} from "../apiSlice.ts";
import {API_CONFIG} from "../../config/api.config.ts";

export const userApi = apiSlice.injectEndpoints({


    endpoints: (builder) => ({
        changeUsername: builder.mutation({
            query: (username) => ({
                    url: API_CONFIG.ENDPOINTS.USER.CHANGE_USERNAME,
                    method: 'POST',
                    body: {username},
            })
        }),
    }),

});

// Auto-generated hooks for your components
export const { useChangeUsernameMutation } = userApi;
