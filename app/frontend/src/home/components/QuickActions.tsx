import { Link } from 'react-router-dom';

type Props = {
    className?: string;
};

export default function QuickActions({ className = '' }: Props) {
    return (
        <div className={`mb-8 ${className}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Ready to play?</h2>
                        <p className="text-gray-600 dark:text-gray-400">Jump into a quick match or explore all modes</p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            to="/game/quick/play"
                            className="px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors" >
                            Quick Match
                        </Link>

                        <Link
                            to="/game"
                            className="px-5 py-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" >
                            All Modes
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
