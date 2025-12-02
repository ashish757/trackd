import {AlertCircle} from "lucide-react";


const ErrorAlert = (prop: {error: string}) => {
    return (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{prop.error}</p>
        </div>
    );
};

export default ErrorAlert;