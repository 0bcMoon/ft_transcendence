import { Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WaitingOverlay() {
    const navigate = useNavigate();
    return (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center max-w-sm w-full px-6 py-8 bg-white/70 rounded-2xl shadow-lg border border-gray-100">

                <div className="relative inline-flex items-center justify-center mb-6">
                    <span className="absolute w-20 h-20 border-4 border-blue-200 rounded-full"></span>
                    <span className="absolute w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                    <Gamepad2 size={28} className="text-blue-600 relative z-10" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2"> Finding Opponent </h2>
                <p className="text-gray-500 mb-6 text-sm">
                    Please wait while we match you with another player...
                </p>

                <button
                    onClick={() => navigate("/")}
                    className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium" >
                    Cancel & return home
                </button>
            </div>
        </div>
    );
}

