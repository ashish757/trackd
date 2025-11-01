import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice.ts';
import authReducer from './auth/authSlice.ts';
import userReducer from "./user/userSlice.ts";

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        user: userReducer,
    },

    // Add the API middleware to enable caching, fetching, and listener management
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});


// This type is the shape of your entire Redux store:
export type RootState = ReturnType<typeof store.getState>;

// Also export the AppDispatch type
export type AppDispatch = typeof store.dispatch;
