import { useNavigate, Link } from 'react-router-dom';
import { History, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/state/authStore';
import { useGetMatchHistory } from '@/api/queries';

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
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" >
            <img
                src={`${import.meta.env.VITE_API_URL}/public/${opponentAvatar}`}
                alt={opponentName}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                onError={(e) => (e.currentTarget.src = `https://placehold.co/56x56/71717a/a3a3a3?text=${opponentName.charAt(0)}`)}
            />
            <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{opponentName}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                        {mode}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 hidden sm:inline">
                        {date}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                    <p className={`text-lg font-bold ${isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isWin ? 'Win' : 'Loss'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{score}</p>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                            <History size={24} className="text-white dark:text-gray-900" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Match History
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {matchHistoryData?.length || 0} matches played
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>

                {/* Match List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="animate-spin text-gray-900 dark:text-white mb-4" size={32} />
                            <p className="text-gray-600 dark:text-gray-400">Loading matches...</p>
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
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                                <History size={32} className="text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No matches yet</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Start playing to see your match history</p>
                            <button
                                onClick={() => navigate('/mode')}
                                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:scale-105 transition-transform"
                            >
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
