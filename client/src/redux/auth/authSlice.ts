import { createSlice } from '@reduxjs/toolkit';
import {authApi} from "./authApi.ts";


const initialState = {
    user: {},
    isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Optional: for updating user details once logged in
        setUser: (state, action) => {
            state.user = action.payload;
        }
    },

    // Listen to the RTK Query mutation results
    extraReducers: (builder) => {

        // Handle both successful Login AND successful OTP Verification (both return tokens)
        builder.addMatcher(
            // Match successful outcome for EITHER the login or the verifyOtp mutation
            authApi.endpoints.login.matchFulfilled,
            (state, { payload }) => {
                // Assume API returns { token: '...', user: { ... } }
                state.user = payload.user;
                state.isAuthenticated = true;
                localStorage.setItem('accessToken', payload.data.accessToken);
                localStorage.setItem('refreshToken', payload.data.refreshToken);

            }
        );

        // Handle successful server-side logout
        builder.addMatcher(
            authApi.endpoints.register.matchFulfilled,
            (state, {payload}) => {

                state.user = payload.user;
                state.isAuthenticated = true;
                localStorage.setItem('accessToken', payload.data.accessToken);
                localStorage.setItem('refreshToken', payload.data.refreshToken);
            }
        );

        // handle client side logout after server confirms logout
        builder.addMatcher(
            authApi.endpoints.logout.matchFulfilled,
            (state) => {
                state.user = {};
                state.isAuthenticated = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        )

    },


});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
