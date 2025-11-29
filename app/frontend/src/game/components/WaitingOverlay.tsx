import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PingPongFillIcon } from '../../image/Icons';

export default function WaitingOverlay() {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="flex flex-col items-center gap-8 w-full max-w-lg p-12 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl">

                <div className="relative flex items-center justify-center w-28 h-28 mb-2">
                    <span className="absolute w-full h-full rounded-full bg-blue-300 dark:bg-blue-800 opacity-60 animate-ping" />
                    <span className="relative w-24 h-24 flex items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700 shadow-lg">
                        <PingPongFillIcon className="w-12 h-12 text-white" />
                    </span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">
                    Finding Opponent...
                </h2>

                <p className="text-lg text-gray-700 dark:text-gray-300 text-center max-w-md">
                    Sit tight while we search for a worthy competitor!
                </p>

                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-3 px-8 py-3.5 mt-3 text-base rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 font-semibold transition-shadow shadow focus:outline-none focus:ring-2 focus:ring-blue-500" >
                    <X size={22} />
                    <span>Cancel</span>


                </button>
            </div>
        </div>
    );
}
