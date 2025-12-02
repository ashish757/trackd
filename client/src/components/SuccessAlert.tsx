import {CheckCircle} from "lucide-react";


const SuccessAlert = (prop: {success: string}) => {
    return (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{prop.success}</p>
        </div>
    );
};

export default SuccessAlert;