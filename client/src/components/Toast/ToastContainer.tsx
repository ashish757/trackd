import Portal from "../Portal.tsx";
import Toast from "./Toast.tsx";
import { useToastContext } from '../../hooks/useToast.ts';

const ToastContainer = () => {
    const { toasts, removeToast } = useToastContext();

    if (toasts.length === 0) return null;

    return (
        <Portal layer="toast">
            <div
            className="fixed top-4 end-4 flex flex-col gap-3 z-50"
        >
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
            </div>
        </Portal>
    );
};

export default ToastContainer;