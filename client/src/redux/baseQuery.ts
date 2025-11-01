import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'

interface RefreshResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

// Base query with token header
const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3000',
    credentials: 'include', // send cookies for refresh
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers;
    },
})

// Add Reauth logic (refresh)
export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)

    if (result?.error?.status === 401) {
        console.warn('Access token expired. Trying to refresh...')

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            // No refresh token, log out
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/signin';
            return result;
        }

        const refreshResult = await baseQuery(
            {
                url: '/auth/refresh-token',
                method: 'POST',
                body: { refreshToken }
            },
            api,
            extraOptions
        )

        if (refreshResult?.data) {
            // save new tokens
            const responseData = refreshResult.data as RefreshResponse;
            const newAccessToken = responseData.data.accessToken;
            const newRefreshToken = responseData.data.refreshToken;

            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Retry original query with new token
            result = await baseQuery(args, api, extraOptions)
        } else {
            // Refresh failed, log out
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/signin';
        }
    }

    return result
}
