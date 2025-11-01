import {apiSlice} from "../apiSlice.ts";
import { API_CONFIG } from "../../config/api.config";

export const authApi = apiSlice.injectEndpoints({
    // reducerPath: 'userApi', // The name of the slice in the store

    // Define data types for cache invalidation
    // tagTypes: ['Auth'] ,

    endpoints: (builder) => ({
        // 1. Initial Login/Registration
        login: builder.mutation({
            query: (credentials) => ({
                url: API_CONFIG.ENDPOINTS.AUTH.LOGIN,
                method: 'POST',
                body: credentials,
            }),
        }),

        // Registration Step 1: Req OTP
        requestOtp: builder.mutation({
            query: (otpData) => ({
                url: API_CONFIG.ENDPOINTS.AUTH.SEND_OTP,
                method: 'POST',
                body: otpData,
            }),
        }),

        // Registration Step 2: OTP Verification and Registration
        register: builder.mutation({
            query: (registerData) => ({
                url: API_CONFIG.ENDPOINTS.AUTH.REGISTER,
                method: 'POST',
                body: registerData,
            }),
        }),

        verifyOtp: builder.mutation({
            query: (verifyOtpData) => ({
                url: API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
                method: 'POST',
                body: verifyOtpData,
            }),
        }),

        // Logout
        logout: builder.mutation({
            query: (logoutData) => ({
                url: API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
                method: 'POST',
                body: logoutData
            }),
        }),


    }),
});

// Auto-generated hooks for your components
export const { useLoginMutation, useRequestOtpMutation, useRegisterMutation , useVerifyOtpMutation, useLogoutMutation} = authApi;
