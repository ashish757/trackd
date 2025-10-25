import { configureStore } from '@reduxjs/toolkit';
import {authApi} from './authApi.ts';
import userReducer from './userSlice';
import authReducer from './authSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
    },

    // Add the API middleware to enable caching, fetching, and listener management
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authApi.middleware),
});


// This type is the shape of your entire Redux store:
export type RootState = ReturnType<typeof store.getState>;

// Also export the AppDispatch type
export type AppDispatch = typeof store.dispatch;
