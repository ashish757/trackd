import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from "./authApi.ts";
import { tokenManager } from "../../utils/tokenManager.ts";
import type { User } from "../user/userApi.ts";


interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: tokenManager.isAuthenticated(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Optional: for updating user details once logged in
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        // Manual logout action
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            tokenManager.clearAccessToken();
        }
    },

    // Listen to the RTK Query mutation results
    extraReducers: (builder) => {

        // Handle successful Login
        builder.addMatcher(
            authApi.endpoints.login.matchFulfilled,
            (state, { payload }) => {
                console.log(payload)
                state.user = payload.data.user || null;
                state.isAuthenticated = true;

                // Store access token in memory (not localStorage!)
                tokenManager.setAccessToken(payload.data.accessToken);

                // Refresh token is in HttpOnly cookie - no need to store in JS
                console.log('Login successful - tokens secured');
            }
        );

        // Handle successful registration
        builder.addMatcher(
            authApi.endpoints.register.matchFulfilled,
            (state, { payload }) => {
                state.user = payload.data.user || null;
                state.isAuthenticated = true;

                // Store access token in memory
                tokenManager.setAccessToken(payload.data.accessToken);

                console.log('Registration successful - tokens secured');
            }
        );

        // Handle successful logout
        builder.addMatcher(
            authApi.endpoints.logout.matchFulfilled,
            (state) => {
                state.user = null;
                state.isAuthenticated = false;

                // Clear access token from memory
                tokenManager.clearAccessToken();

                // HttpOnly cookie will be cleared by server
                console.log('Logged out successfully');
            }
        );
    },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
