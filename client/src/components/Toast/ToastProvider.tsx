import React, { useState, useCallback } from 'react';
import { ToastContext, type Toast, type ToastType } from '../../hooks/useToast.ts';

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
        const id = `${Date.now()}-${Math.random()}`;

        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after specified duration
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

