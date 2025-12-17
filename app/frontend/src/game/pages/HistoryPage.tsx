import { useNavigate, Link } from 'react-router-dom';
import { History, ArrowLeft, Loader2, Gamepad2 } from 'lucide-react';
import { useAuthStore } from '@/state/authStore';
import { useGetMatchHistory } from '../api/queries';

interface MatchHistoryItemProps {
    matchId: number;
    opponentName: string;
    opponentAvatar: string;
    isWin: boolean;
    score: string;
    mode: string;
    date: string;
}

function MatchHistoryItem({ matchId, opponentName, opponentAvatar, isWin, score, mode, date }: MatchHistoryItemProps) {
    return (
        <Link
            to={`/history/${matchId}`}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
        >
            <img
                src={`${import.meta.env.VITE_API_URL}/public/${opponentAvatar}`}
                alt={opponentName}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-slate-700 ring-2 ring-gray-100 dark:ring-slate-800"
                onError={(e) => (e.currentTarget.src = `https://placehold.co/64x64/71717a/a3a3a3?text=${opponentName.charAt(0)}`)}
            />
            <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{opponentName}</p>
                <div className="flex items-center gap-2 mt-1. 5">
                    <span className="text-xs font-medium px-2. 5 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                        {mode}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-slate-400 hidden sm:inline">
                        {date}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                    <p className={`text-xl font-bold ${isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isWin ? 'Win' : 'Loss'}
                    </p>
                    <p className="text-base font-medium text-gray-600 dark:text-slate-400">{score}</p>
                </div>
            </div>
        </Link>
    );
}

function HistoryPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const { data: matchHistoryData, isLoading } = useGetMatchHistory(user?.id || 0);

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-gray-50 dark:bg-slate-950 py-6 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-gray-600 dark:text-slate-400 
                               hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900 
                               rounded-lg transition-all font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <History className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                Match History
                            </h1>
                            <p className="text-base text-gray-600 dark:text-slate-400 mt-1">
                                {matchHistoryData?.length || 0} {matchHistoryData?.length === 1 ? 'match' : 'matches'} played
                            </p>
                        </div>
                    </div>
                </div>

                {/* Match List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 mb-4" size={40} />
                            <p className="text-gray-700 dark:text-slate-300 font-medium text-lg">Loading matches...</p>
                        </div>
                    ) : matchHistoryData && matchHistoryData.length > 0 ? (
                        <div className="p-4 space-y-2">
                            {matchHistoryData.map(match => (
                                <MatchHistoryItem
                                    key={match.matchId}
                                    matchId={match.matchId}
                                    opponentName={match.opponent_name}
                                    opponentAvatar={match.opponent_avatar}
                                    isWin={match.isWin}
                                    score={match.user_score + " - " + match.opponent_score}
                                    mode={match.mode}
                                    date={match.date}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-5">
                                <Gamepad2 className="w-12 h-12 text-gray-400 dark:text-slate-600" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Matches Yet</h3>
                            <p className="text-base text-gray-600 dark:text-slate-400 mb-6 text-center max-w-sm">
                                Start playing to see your match history and track your progress
                            </p>
                            <button
                                onClick={() => navigate('/mode')}
                                className="inline-flex items-center justify-center gap-2. 5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 
                                           text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 
                                           transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Gamepad2 className="w-5 h-5" />
                                Play Now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HistoryPage;
