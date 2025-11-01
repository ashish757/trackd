import {apiSlice} from "../apiSlice.ts";

export const authApi = apiSlice.injectEndpoints({
    // reducerPath: 'userApi', // The name of the slice in the store

    // Define data types for cache invalidation
    // tagTypes: ['Auth'] ,

    endpoints: (builder) => ({
        // 1. Initial Login/Registration
        login: builder.mutation({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
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
        register: builder.mutation({
            query: (registerData) => ({
                url: 'register',
                method: 'POST',
                body: registerData,
            }),

        }),
        verifyOtp: builder.mutation({
        query: (veifyOtpData) => ({
            url: 'verify-otp',
            method: 'POST',
            body: veifyOtpData,
            }),
       }),

        // Logout
        logout: builder.mutation({
            query: (logoutData) => ({
                url: 'logout',
                method: 'POST',
                body: logoutData
            }),
        }),


    }),
});

// Auto-generated hooks for your components
export const { useLoginMutation, useRequestOtpMutation, useRegisterMutation , useVerifyOtpMutation, useLogoutMutation} = authApi;
