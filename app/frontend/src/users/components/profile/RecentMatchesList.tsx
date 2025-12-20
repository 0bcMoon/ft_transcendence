import { Link } from 'react-router-dom';
import { History, ArrowRight } from 'lucide-react';
import { useGetRecentMatches } from '../../../game/api/queries';
import type { RecentMatch } from '../../../game/api/gameApi';

type Props = {
    userId: number;
    limit?: number;
};

export default function RecentMatchesList({ userId, limit = 5 }: Props) {
    const {
        data: matches = [],
        isLoading,
        isError,
        error,
        isFetching,
    } = useGetRecentMatches(userId, limit);

    const getWinner = (match: RecentMatch) => {
        if (match.player1_score > match.player2_score) return 'p1';
        if (match.player2_score > match.player1_score) return 'p2';
        return 'draw';
    };

    const getAvatar = (avatar: string | null | undefined, name: string) =>
        avatar
            ? `${import.meta.env.VITE_API_URL}/public/${avatar}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=48`;

    const getModeLabel = (mode: string) => {
        const labels: Record<string, string> = {
            remote: 'Online Match',
            local: 'Local',
            tournament: 'Tournament',
        };
        return labels[mode] || mode;
    };

    return (
        <section className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Header */}
            <header className="px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <History size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-white">Recent Matches</h3>
                        <p className="text-xs text-slate-400 hidden sm:block">Latest remote & tournament matches</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {isFetching && <span className="text-xs text-slate-400">Refreshing…</span>}
                    <Link
                        to="/history"
                        className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 sm:gap-2 font-medium transition-colors"
                    >
                        View all
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="p-2 sm:p-3">
                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-1.5 sm:space-y-2">
                        {[...Array(Math.min(3, limit))].map((_, i) => (
                            <div key={i} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg bg-slate-800/50 animate-pulse">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-700" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 sm:w-40 bg-slate-700 rounded" />
                                    <div className="h-3 w-20 sm:w-24 bg-slate-700 rounded" />
                                </div>
                                <div className="w-16 sm:w-24 h-6 sm:h-8 bg-slate-700 rounded" />
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-700" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="py-6 sm:py-8 text-center">
                        <div className="text-sm sm:text-base text-red-400 mb-2">⚠️ Failed to load matches</div>
                        {error instanceof Error && <p className="text-xs text-slate-400">{error.message}</p>}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && matches.length === 0 && (
                    <div className="py-8 sm:py-10 text-center">
                        <History size={36} className="mx-auto mb-3 text-slate-600" />
                        <p className="text-xs sm:text-sm text-slate-400">No recent matches</p>
                    </div>
                )}

                {/* Matches List */}
                {!isLoading && !isError && matches.length > 0 && (
                    <ul className="space-y-1.5 sm:space-y-2">
                        {matches.slice(0, limit).map((match) => {
                            const winner = getWinner(match);
                            const p1Win = winner === 'p1';
                            const p2Win = winner === 'p2';
                            return (
                                <li key={match.id}>
                                    <Link
                                        to={`/history/${match.id}`}
                                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800/50 hover:border-slate-700 transition-all duration-200"
                                    >
                                        {/* Mobile: stacked */}
                                        <div className="flex sm:hidden flex-col gap-2 w-full">
                                            <div className="flex items-center justify-between gap-2">
                                                {/* Player 1 */}
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <img
                                                        src={getAvatar(match.player1_avatar, match.player1_name)}
                                                        alt={match.player1_name}
                                                        className={`w-10 h-10 rounded-full object-cover border-2 ${p1Win ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-slate-600'}`}
                                                        onError={(e) => { e.currentTarget.src = getAvatar(null, match.player1_name); }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-xs font-medium truncate ${p1Win ? 'text-white' : 'text-slate-400'}`}>
                                                            {match.player1_name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Score */}
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-bold ${p1Win ? 'text-green-500' : 'text-slate-300'}`}>{match.player1_score}</span>
                                                    <span className="text-xs text-slate-500">-</span>
                                                    <span className={`text-lg font-bold ${p2Win ? 'text-green-500' : 'text-slate-300'}`}>{match.player2_score}</span>
                                                </div>

                                                {/* Player 2 */}
                                                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                                    <div className="min-w-0 text-right">
                                                        <p className={`text-xs font-medium truncate ${p2Win ? 'text-white' : 'text-slate-400'}`}>{match.player2_name}</p>
                                                    </div>
                                                    <img
                                                        src={getAvatar(match.player2_avatar, match.player2_name)}
                                                        alt={match.player2_name}
                                                        className={`w-10 h-10 rounded-full object-cover border-2 ${p2Win ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-slate-600'}`}
                                                        onError={(e) => { e.currentTarget.src = getAvatar(null, match.player2_name); }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <span>{getModeLabel(match.mode)}</span>
                                            </div>
                                        </div>

                                        {/* Desktop: horizontal */}
                                        <div className="hidden sm:flex items-center gap-4 w-full">
                                            {/* Player 1 */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <img
                                                    src={getAvatar(match.player1_avatar, match.player1_name)}
                                                    alt={match.player1_name}
                                                    className={`w-12 h-12 rounded-full object-cover border-2 ${p1Win ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-slate-600'}`}
                                                    onError={(e) => { e.currentTarget.src = getAvatar(null, match.player1_name); }}
                                                />
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-medium truncate ${p1Win ? 'text-white' : 'text-slate-400'}`}>{match.player1_name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-500">{getModeLabel(match.mode)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-baseline gap-3">
                                                    <span className={`text-xl font-bold ${p1Win ? 'text-green-500' : 'text-slate-300'}`}>{match.player1_score}</span>
                                                    <span className="text-xs text-slate-500">–</span>
                                                    <span className={`text-xl font-bold ${p2Win ? 'text-green-500' : 'text-slate-300'}`}>{match.player2_score}</span>
                                                </div>
                                            </div>

                                            {/* Player 2 */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                                                <div className="min-w-0 text-right">
                                                    <p className={`text-sm font-medium truncate ${p2Win ? 'text-white' : 'text-slate-400'}`}>{match.player2_name}</p>
                                                </div>
                                                <img
                                                    src={getAvatar(match.player2_avatar, match.player2_name)}
                                                    alt={match.player2_name}
                                                    className={`w-12 h-12 rounded-full object-cover border-2 ${p2Win ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-slate-600'}`}
                                                    onError={(e) => { e.currentTarget.src = getAvatar(null, match.player2_name); }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
