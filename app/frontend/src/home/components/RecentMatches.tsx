import { Link } from "react-router-dom";
import { History } from "lucide-react";
import { useGetGlobalMatches } from "@/game/api/queries";
import type { GlobalMatchData } from "@/game/types/types";

type Props = {
    limit?: number;
};

export default function RecentMatches({ limit = 6 }: Props) {
    const { data: matches = [], isLoading, isError } = useGetGlobalMatches(limit);

    const getAvatar = (avatar: string | null, name: string) =>
        avatar
            ? `${import.meta.env.VITE_API_URL}/public/${avatar}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=64`;

    const getModeLabel = (mode: string) => {
        const labels = { remote: '1v1', local: 'Local', ai: 'AI', tournament: 'Tournament' };
        return labels[mode as keyof typeof labels] || mode;
    };

    const getWinner = (match: GlobalMatchData) => {
        if (match.player1_score > match.player2_score) return 'p1';
        if (match.player2_score > match.player1_score) return 'p2';
        return 'draw';
    };

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
                    <History className="w-6 h-6 text-blue-400" />
                    Recent Matches
                </h2>
                <Link
                    to="/matches"
                    className="text-blue-400 hover:text-blue-300 font-semibold text-sm px-3 transition"
                >
                    See all matches &rarr;
                </Link>
            </div>
            <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-800 overflow-hidden p-0">
                {isLoading && (
                    <div className="space-y-3 p-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 px-4 rounded-xl bg-slate-800/60 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-slate-700" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-24 bg-slate-700 rounded" />
                                    <div className="h-3 w-16 bg-slate-800 rounded" />
                                </div>
                                <div className="w-12 h-5 bg-slate-700 rounded" />
                                <div className="w-12 h-12 rounded-full bg-slate-700" />
                            </div>
                        ))}
                    </div>
                )}
                {isError && (
                    <div className="py-10 text-center text-red-400 font-semibold text-base">
                        Failed to load matches
                    </div>
                )}
                {!isLoading && !isError && matches.length === 0 && (
                    <div className="py-10 text-center text-slate-400 text-base">
                        <History className="w-8 h-8 mx-auto mb-2" />
                        No recent matches
                    </div>
                )}
                {!isLoading && !isError && matches.length > 0 && (
                    <ul className="divide-y divide-slate-800">
                        {matches.slice(0, limit).map((match) => {
                            const winner = getWinner(match);
                            const p1Win = winner === "p1";
                            const p2Win = winner === "p2";
                            return (
                                <li key={match.matchId}>
                                    <Link
                                        to={`/history/${match.matchId}`}
                                        className="flex items-center gap-3 py-4 px-6 bg-transparent hover:bg-blue-900/30 transition rounded-xl block"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <img
                                                src={getAvatar(match.player1_avatar, match.player1_name)}
                                                alt={match.player1_name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                                            />
                                            <div>
                                                <p className={`text-sm font-semibold ${p1Win ? "text-blue-200" : "text-slate-400"} group-hover:text-white transition`}>
                                                    {match.player1_name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {getModeLabel(match.mode)} &bull; {match.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="font-extrabold text-lg mx-2 flex-shrink-0">
                                            <span className={p1Win ? "text-blue-300" : "text-slate-400"}>{match.player1_score}</span>
                                            <span className="mx-2 text-slate-500">-</span>
                                            <span className={p2Win ? "text-blue-300" : "text-slate-400"}>{match.player2_score}</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-1 justify-end">
                                            <div className="text-right">
                                                <p className={`text-sm font-semibold ${p2Win ? "text-blue-200" : "text-slate-400"} group-hover:text-white transition`}>
                                                    {match.player2_name}
                                                </p>
                                                <p className="text-xs text-slate-400">Opponent</p>
                                            </div>
                                            <img
                                                src={getAvatar(match.player2_avatar, match.player2_name)}
                                                alt={match.player2_name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
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
