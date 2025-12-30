interface Props {
    message: string;
    type: 'ALERT' | 'ERROR' | 'WARNING' | 'SUCCESS';
    onClose?: () => void;
}

const Toast = ({message, type, onClose}: Props) => {

    const colorClasses = type === 'SUCCESS' ? 'bg-green-100 text-green-900 border-green-200' :
        type === 'ERROR' ? 'bg-red-100 text-red-900 border-red-200' :
        type === 'WARNING' ? 'bg-yellow-100 text-yellow-900 border-yellow-200' :
        'bg-blue-100 text-blue-900 border-blue-200';

    return (
        <div
            className={`${colorClasses} flex items-center w-full max-w-xs p-3 rounded-full border animate-slide-in`}
            role="alert"
        >
            <div className="text-md font-normal flex-1">{message}</div>

            {onClose && (
                <button
                    onClick={onClose}
                    className="ms-auto -mx-1.5 -my-1.5 rounded-full p-1 hover:bg-black/10 inline-flex items-center justify-center h-8 w-8 transition-colors"
                    aria-label="Close"
                >
                    <span className="sr-only">Close</span>
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </button>
            )}
        </div>
    );
};

export default Toast;