import { MessageSquare, Gamepad2 } from 'lucide-react';

export default function Notification() {
    return (
        <div className="fixed sm:absolute top-16 sm:top-auto right-4 sm:right-0 left-4 sm:left-auto mt-0 sm:mt-2 w-auto sm:w-80 
                       bg-white rounded-lg shadow-lg border border-gray-200 z-50
                       dark:bg-slate-900 dark:border-slate-700">
            <div className="max-h-96 overflow-y-auto">
                <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 dark:hover:bg-slate-800 dark:border-slate-800">
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 dark:bg-blue-900">
                            <MessageSquare size={20} className="text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">New message from John</p>
                            <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">Hey, are you available for a quick chat?</p>
                            <p className="text-xs text-gray-400 mt-1 dark:text-slate-500">2 minutes ago</p>
                        </div>
                    </div>
                </button>

                <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 dark:hover:bg-slate-800 dark:border-slate-800">
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 dark:bg-green-900">
                            <Gamepad2 size={20} className="text-green-600 dark:text-green-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">Game invitation</p>
                            <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">Sarah invited you to play Chess</p>
                            <p className="text-xs text-gray-400 mt-1 dark:text-slate-500">15 minutes ago</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
