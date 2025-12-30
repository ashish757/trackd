import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'ALERT' | 'ERROR' | 'WARNING' | 'SUCCESS';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
}

const initialState: ToastState = {
    toasts: [],
};

interface AddToastPayload {
    message: string;
    type: ToastType;
    duration?: number;
}

const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        addToast: (state, action: PayloadAction<AddToastPayload>) => {
            const id = `${Date.now()}-${Math.random()}`;
            const toast: Toast = {
                id,
                message: action.payload.message,
                type: action.payload.type,
                duration: action.payload.duration || 5000,
            };
            state.toasts.push(toast);
        },
        removeToast: (state, action: PayloadAction<string>) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        },
        clearAllToasts: (state) => {
            state.toasts = [];
        },
    },
});

export const { addToast, removeToast, clearAllToasts } = toastSlice.actions;
export default toastSlice.reducer;

