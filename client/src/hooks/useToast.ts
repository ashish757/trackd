import { useDispatch } from 'react-redux';
import { addToast } from '../redux/toast/toastSlice';
import type { AppDispatch } from '../redux/store';

export const useToast = () => {
    const dispatch = useDispatch<AppDispatch>();

    return {
        success: (message: string, duration?: number) =>
            dispatch(addToast({ message, type: 'SUCCESS', duration })),

        error: (message: string, duration?: number) =>
            dispatch(addToast({ message, type: 'ERROR', duration })),

        warning: (message: string, duration?: number) =>
            dispatch(addToast({ message, type: 'WARNING', duration })),

        alert: (message: string, duration?: number) =>
            dispatch(addToast({ message, type: 'ALERT', duration })),
    };
};

