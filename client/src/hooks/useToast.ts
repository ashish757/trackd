import { createContext, useContext } from 'react';

export type ToastType = 'ALERT' | 'ERROR' | 'WARNING' | 'SUCCESS';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    const { addToast } = context;

    return {
        success: (message: string, duration?: number) => addToast(message, 'SUCCESS', duration),
        error: (message: string, duration?: number) => addToast(message, 'ERROR', duration),
        warning: (message: string, duration?: number) => addToast(message, 'WARNING', duration),
        alert: (message: string, duration?: number) => addToast(message, 'ALERT', duration),
    };
};

export const useToastContext = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }

    return context;
};

