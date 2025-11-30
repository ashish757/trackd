import { createSlice } from '@reduxjs/toolkit';
import {type User, userApi} from "./userApi.ts";
import {tokenManager} from "../../utils/tokenManager.ts";



interface UserState {
    user: User | null;
}

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null
    } as UserState,
    reducers: {},
    extraReducers: (builder) => {
                // Handle successful username change
                builder.addMatcher(
                    userApi.endpoints.changeUsername.matchFulfilled,
                    (state, { meta }) => {
                        // Update the username in the auth state
                        if (state.user) {
                            state.user.username = meta.arg.originalArgs;
                        }
                    }
                )
        builder.addMatcher(
            userApi.endpoints.changePassword.matchFulfilled,
            (_state, { payload }) => {
                // Password change does not affect user state directly
                tokenManager.setAccessToken(payload.data.accessToken)
            }
        )

    },
});

// export const {  } = userSlice.actions;
export default userSlice.reducer;
