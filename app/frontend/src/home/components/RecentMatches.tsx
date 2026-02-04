import { Link } from "react-router-dom";
import { History, Loader2, AlertCircle } from "lucide-react";
import { useGetGlobalMatches } from "@/game/hooks/queries";

export default function RecentMatches() {
    const { data: matches = [], isLoading, isError } = useGetGlobalMatches(1, 6);

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-400" />
                    Recent Matches
                </h2>
                <Link
                    to="/history"
                    className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition" >
                    View All
                </Link>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                    <p className="text-xl text-slate-300">Failed to load matches</p>
                </div>
            )}

            {!isLoading && !isError && matches.length === 0 && (
                <div className="flex items-center justify-center p-20">
                    <p className="text-slate-400">No matches yet</p>
                </div>
            )}

            {!isLoading && !isError && matches.length > 0 && (
                <ul className="divide-y divide-slate-800">
                    {matches.map((match) => (
                        <li key={match.id}>
                            <Link
                                to={`/history/${match.id}`}
                                className="flex items-center gap-4 p-6 hover:bg-slate-800 transition" >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <img
                                        src={match.player1_profile_picture}
                                        alt={match.player1_username}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                                    />
                                    <span className="text-sm font-semibold text-slate-300 truncate">
                                        {match.player1_username}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <div className="text-lg font-bold">
                                        <span className="text-white">{match.player1_score}</span>
                                        <span className="text-slate-600 mx-2">-</span>
                                        <span className="text-white">{match.player2_score}</span>
                                    </div>
                                    <span className="text-xs text-slate-500 uppercase">
                                        {match.mode}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                                    <span className="text-sm font-semibold text-slate-300 truncate text-right">
                                        {match.player2_username}
                                    </span>
                                    <img
                                        src={match.player2_profile_picture}
                                        alt={match.player2_username}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                                    />
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
