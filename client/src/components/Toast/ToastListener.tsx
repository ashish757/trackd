import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { removeToast } from '../../redux/toast/toastSlice';
import Portal from '../Portal';
import Toast from './Toast';


const ToastListener = () => {
    const toasts = useSelector((state: RootState) => state.toast.toasts);
    const dispatch = useDispatch<AppDispatch>();

    // Auto-remove toasts after their duration
    useEffect(() => {
        const timers: number[] = [];

        toasts.forEach((toast) => {
            const timer = setTimeout(() => {
                dispatch(removeToast(toast.id));
            }, toast.duration || 5000);

            timers.push(timer as unknown as number);
        });

        // Cleanup timers on unmount or when toasts change
        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [toasts, dispatch]);

    if (toasts.length === 0) return null;

    return (
        <Portal layer="toast">

            <div className="fixed top-4 right-4 flex flex-col gap-3 z-50">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => dispatch(removeToast(toast.id))}
                />
            ))}
            </div>

        </Portal>
    );
};

export default ToastListener;

