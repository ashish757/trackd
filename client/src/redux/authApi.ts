import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
    reducerPath: 'userApi', // The name of the slice in the store

    // Set the base URL for all requests
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/auth/',
        // Common requirement: Add authorization header to every request
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token'); // or get it from your Redux state
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),

    // Define data types for cache invalidation
    tagTypes: ['Auth'] ,

    endpoints: (builder) => ({
        // 1. Initial Login/Registration
        login: builder.mutation({
            query: (credentials) => ({
                url: 'login',
                method: 'POST',
                body: credentials,
            }),
            // This is a key step: successful verification finalizes auth,
            // so we use a standard slice matcher to handle the token/user update.
        }),

        // Registration Step 1: Req OTP
        requestOtp: builder.mutation({
            query: (otpData) => ({
                url: 'send-otp',
                method: 'POST',
                body: otpData,
            }),

        }),

        // Registration Step 2: OTP Verification and Registration
        verifyOtpAndRegister: builder.mutation({
            query: (registerData) => ({
                url: 'register',
                method: 'POST',
                body: registerData,
            }),

        }),


    }),
});

// Auto-generated hooks for your components
export const { useLoginMutation, useRequestOtpMutation, useVerifyOtpAndRegisterMutation } = authApi;
