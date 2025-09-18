import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WaitingOverlay() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center w-full h-96 bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Simple Loading Spinner */}
            <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <Search size={24} className="absolute inset-0 m-auto text-blue-500" />
            </div>

            {/* Content */}
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-xl font-semibold text-gray-900">
                    Finding opponent
                </h2>
                <p className="text-gray-600 text-sm">
                    Please wait while we match you with another player
                </p>
            </div>

            {/* Cancel Button */}
            <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
            >
                <X size={16} />
                <span>Cancel</span>
            </button>
        </div>
    );
}
