import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/state/authStore';
import { ArrowLeft, Trophy, Clock, Calendar, Target, Loader2, XCircle } from 'lucide-react';
import { useGetGameDetails } from "../api/queries";

function PlayerCard({ name, avatar, score, isWinner }: { name: string; avatar: string; score: number; isWinner: boolean; isUser: boolean; }) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <img
                    src={`${import.meta.env.VITE_API_URL}/public/${avatar}`}
                    alt={name}
                    className={`w-32 h-32 rounded-full object-cover border-4 ${isWinner
                        ? 'border-green-500 dark:border-green-400'
                        : 'border-red-500 dark:border-red-400'
                        }`}
                    onError={(e) => (e.currentTarget.src = `https://placehold.co/128x128/71717a/a3a3a3?text=${name.charAt(0)}`)}
                />
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 rounded-full p-2 ${isWinner
                    ? 'bg-green-500 dark:bg-green-400'
                    : 'bg-red-500 dark:bg-red-400'
                    }`}>
                    {isWinner ? (
                        <Trophy size={18} className="text-white dark:text-green-950" />
                    ) : (
                        <XCircle size={18} className="text-white dark:text-red-950" />
                    )}
                </div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {name}
            </h3>
            <p className={`mt-3 text-5xl font-bold ${isWinner
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
                }`}>
                {score}
            </p>
        </div>
    );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string; }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-gray-900 dark:text-white">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-500 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

export default function MatchDetailsPage() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const gameId = Number(matchId);

    const { data: gameDetails, isLoading, isError } = useGetGameDetails(gameId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-gray-900 dark:text-white" size={32} />
                    <p className="text-gray-600 dark:text-gray-400">Loading match details...</p>
                </div>
            </div>
        );
    }

    if (isError || !gameDetails) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Match not found</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const userPlayer = gameDetails.players.find(p => p.user_id === user?.id) || gameDetails.players[0];
    const opponentPlayer = gameDetails.players.find(p => p.user_id !== user?.id) || gameDetails.players[1];
    const userName = userPlayer?.username || (userPlayer?.position === 1 ? "Player 1" : "Player 2");
    const userAvatar = userPlayer?.avatar || "";
    const opponentName = opponentPlayer?.username || (opponentPlayer?.position === 1 ? "Player 1" : "Player 2");
    const opponentAvatar = opponentPlayer?.avatar || "";
    const isWin = gameDetails.winner_id === userPlayer?.user_id;

    let duration = "N/A";
    if (gameDetails.started_at && gameDetails.ended_at) {
        const start = new Date(gameDetails.started_at).getTime();
        const end = new Date(gameDetails.ended_at).getTime();
        const minutes = Math.floor((end - start) / 60000);
        const seconds = Math.floor(((end - start) % 60000) / 1000);
        duration = `${minutes}m ${seconds}s`;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-900 dark:text-white hover:opacity-70 transition-opacity font-semibold" >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                </div>

                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Match Details
                    </h1>
                </div>

                {/* Players Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
                        {/* User Player */}
                        <PlayerCard
                            name={userName}
                            avatar={userAvatar}
                            score={userPlayer?.score ?? 0}
                            isWinner={isWin}
                            isUser={true}
                        />

                        {/* VS Divider */}
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center mx-auto mb-2">
                                    <span className="text-2xl font-bold text-white dark:text-gray-900">VS</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500">{gameDetails.mode}</p>
                            </div>
                        </div>

                        {/* Opponent Player */}
                        <PlayerCard
                            name={opponentName}
                            avatar={opponentAvatar}
                            score={opponentPlayer?.score ?? 0}
                            isWinner={!isWin}
                            isUser={false}
                        />
                    </div>
                </div>

                {/* Match Info */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Match Information</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <StatItem
                            icon={<Calendar size={20} strokeWidth={1.5} />}
                            label="Date"
                            value={new Date(gameDetails.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        />
                        <StatItem
                            icon={<Clock size={20} strokeWidth={1.5} />}
                            label="Duration"
                            value={duration}
                        />
                        <StatItem
                            icon={<Target size={20} strokeWidth={1.5} />}
                            label="Game Mode"
                            value={gameDetails.mode}
                        />
                        <StatItem
                            icon={<Trophy size={20} strokeWidth={1.5} />}
                            label="Match ID"
                            value={`#${gameDetails.id}`}
                        />
                    </div>

                    {/* Timeline */}
                    {gameDetails.started_at && gameDetails.ended_at && (
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Timeline</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Started</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {new Date(gameDetails.started_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Ended</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {new Date(gameDetails.ended_at).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
