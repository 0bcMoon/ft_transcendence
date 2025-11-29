import { Link } from 'react-router-dom';
import { History, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/state/authStore';
import { useGetGlobalMatches } from '../../game/api/queries';
import type { GameMode } from '@/game/types/types';

export interface GlobalMatchData {
    matchId: number;
    mode: GameMode;
    date: string;
    player1_id?: number | null;
    player1_name: string;
    player1_avatar: string;
    player1_score: number;
    player2_id?: number | null;
    player2_name: string;
    player2_avatar: string;
    player2_score: number;
    winner_id?: number | null;
}

type Props = {
    limit?: number;
};

export default function RecentGamesList({ limit = 5 }: Props) {
    const user = useAuthStore((s) => s.user);
    const { data: globalGames, isLoading, isError, error, isFetching } = useGetGlobalMatches(limit);
    const matches: GlobalMatchData[] = globalGames ?? [];

    const decideWinner = (m: GlobalMatchData) => {
        if (typeof m.winner_id === 'number') {
            if (m.player1_id != null && m.winner_id === m.player1_id)
                return 'p1';
            if (m.player2_id != null && m.winner_id === m.player2_id)
                return 'p2';
        }
        if (m.player1_score > m.player2_score)
            return 'p1';
        if (m.player2_score > m.player1_score)
            return 'p2';
        return 'draw';
    };

    return (
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <header className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 flex items-center justify-center">
                        <History size={18} className="text-white dark:text-gray-900" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Games</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Latest online matches</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isFetching && <span className="text-xs text-gray-500 dark:text-gray-400">Refreshing…</span>}
                    <Link to="/history" className="text-sm text-gray-900 dark:text-white inline-flex items-center gap-2">
                        View all <ArrowRight size={14} />
                    </Link>
                </div>
            </header>

            <div className="p-3">
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: Math.min(3, limit) }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                                <div className="flex-1">
                                    <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                                </div>
                                <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="py-8 text-center text-sm text-red-600 dark:text-red-400">
                        Failed to load matches{error ? `: ${error.message}` : '.'}
                    </div>
                ) : matches.length === 0 ? (
                    <div className="py-10 text-center">
                        <History size={36} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">No recent online matches</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {matches.slice(0, limit).map((m) => {
                            const winner = decideWinner(m);
                            const p1Win = winner === 'p1';
                            const p2Win = winner === 'p2';
                            const userIsP1 = user && m.player1_id != null && user.id === m.player1_id;
                            const userIsP2 = user && m.player2_id != null && user.id === m.player2_id;

                            return (
                                <li key={m.matchId}>
                                    <Link
                                        to={`/history/${m.matchId}`}
                                        className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        aria-label={`Match ${m.player1_name} versus ${m.player2_name}`} >
                                        {/* Left player */}
                                        <div className="flex items-center gap-3 w-1/3 min-w-0">
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}/public/${m.player1_avatar}`}
                                                alt={m.player1_name}
                                                className={`w-12 h-12 rounded-full object-cover border-2 ${p1Win ? 'border-green-500' : 'border-red-500'} shadow-sm`}
                                                onError={(e: any) => (e.currentTarget.src = `https://placehold.co/48x48/71717a/a3a3a3?text=${m.player1_name?.charAt(0) || '?'}`)}
                                            />
                                            <div className="min-w-0">
                                                <p className={`text-sm font-medium truncate ${p1Win ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {m.player1_name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {userIsP1 && <span className="text-xs px-2 py-0.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded">You</span>}
                                                    <span className="text-xs text-gray-400">{m.mode}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* score */}
                                        <div className="flex flex-col items-center justify-center w-1/3">
                                            <div className="flex items-baseline gap-4">
                                                <span className={`text-2xl font-bold ${p1Win ? 'text-green-600' : 'text-gray-700 dark:text-gray-200'}`}>
                                                    {m.player1_score}
                                                </span>
                                                <span className="text-sm text-gray-400">–</span>
                                                <span className={`text-2xl font-bold ${p2Win ? 'text-green-600' : 'text-gray-700 dark:text-gray-200'}`}>
                                                    {m.player2_score}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">{m.date}</div>
                                        </div>

                                        {/* Right player */}
                                        <div className="flex items-center gap-3 justify-end w-1/3">
                                            <div className="text-right min-w-0">
                                                <p className={`text-sm font-medium truncate ${p2Win ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {m.player2_name}
                                                </p>
                                                <div className="flex items-center justify-end gap-2">
                                                    {userIsP2 && <span className="text-xs px-2 py-0.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded">You</span>}
                                                    <span className="text-xs text-gray-400 hidden sm:inline">{/* placeholder for extra info */}</span>
                                                </div>
                                            </div>
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}/public/${m.player2_avatar}`}
                                                alt={m.player2_name}
                                                className={`w-12 h-12 rounded-full object-cover border-2 ${p2Win ? 'border-green-500' : 'border-red-500'} shadow-sm`}
                                                onError={(e: any) => (e.currentTarget.src = `https://placehold.co/48x48/71717a/a3a3a3?text=${m.player2_name?.charAt(0) || '?'}`)}
                                            />
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
