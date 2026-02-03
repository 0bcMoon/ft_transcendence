import { Link } from "react-router-dom";
import { Trophy, Loader2, AlertCircle } from "lucide-react";
import { useGetTopPlayers } from "@/game/hooks/queries";

export default function TopPlayers() {
    const { data: topPlayers = [], isLoading, isError } = useGetTopPlayers(6);

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-400" />
                    Top Players
                </h2>
                <Link
                    to="/leaderboard"
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
                    <p className="text-xl text-slate-300">Failed to load players</p>
                </div>
            )}

            {!isLoading && !isError && topPlayers.length === 0 && (
                <div className="flex items-center justify-center p-20">
                    <p className="text-slate-400">No players found</p>
                </div>
            )}

            {!isLoading && !isError && topPlayers.length > 0 && (
                <ul className="divide-y divide-slate-800">
                    {topPlayers.map((player, index) => (
                        <li key={player.id}>
                            <Link
                                to={`/users/${player.id}`}
                                className="flex items-center gap-4 p-6 hover:bg-slate-800 transition" >
                                <div className="w-8 text-center flex-shrink-0">
                                    <span className="text-lg font-bold text-slate-400">
                                        {index + 1}
                                    </span>
                                </div>

                                <img
                                    src={player.profile_picture}
                                    alt={player.username}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                                />

                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-semibold text-slate-300 truncate block">
                                        {player.username}
                                    </span>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <span className="text-sm font-bold text-blue-400">
                                        {player.total_xp.toLocaleString()} XP
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
