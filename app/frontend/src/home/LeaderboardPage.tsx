import { useGetTopPlayers } from "@/game/api/queries";
import { Medal, Gem, Crown, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const rankProps = {
    Bronze: { color: "text-orange-400", bg: "bg-orange-100/10", icon: <Medal color="#b87333" className="w-4 h-4" /> },
    Silver: { color: "text-slate-300", bg: "bg-slate-100/10", icon: <Medal color="#C0C0C0" className="w-4 h-4" /> },
    Gold: { color: "text-yellow-200", bg: "bg-yellow-100/10", icon: <Medal color="#FFD700" className="w-4 h-4" /> },
    Platinum: { color: "text-teal-200", bg: "bg-teal-100/10", icon: <Gem color="#60e6d0" className="w-4 h-4" /> },
    Master: { color: "text-indigo-300", bg: "bg-indigo-100/10", icon: <Crown color="#a78bfa" className="w-4 h-4" /> }
};

const getPositionStyle = (position: number) => {
    if (position === 1) return { color: "text-yellow-400", icon: <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />, ring: "border-4 border-yellow-400" };
    if (position === 2) return { color: "text-slate-400", icon: <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />, ring: "border-4 border-slate-400" };
    if (position === 3) return { color: "text-orange-400", icon: <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />, ring: "border-4 border-orange-400" };
    return null;
};

const getAvatar = (avatar: string | null, name: string) =>
    avatar
        ? `${import.meta.env.VITE_API_URL}/public/${avatar}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=64`;

export default function LeaderboardPage() {
    const { data: topPlayers, isLoading, isError } = useGetTopPlayers(25);
    const navigate = useNavigate();

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-slate-950 py-6 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Trophy className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">Leaderboard</h1>
                            <p className="text-base text-slate-400 mt-1">
                                Top {topPlayers?.length || 0} players worldwide
                            </p>
                        </div>
                    </div>
                </div>

                {/* Player List */}
                <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-800 overflow-hidden p-0">
                    {isLoading && (
                        <div className="space-y-3 p-6">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 py-6 px-8 rounded-xl bg-slate-800/60 animate-pulse">
                                    <div className="w-8 h-8 bg-slate-700 rounded" />
                                    <div className="w-16 h-16 rounded-full bg-slate-700" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-32 bg-slate-700 rounded" />
                                        <div className="h-3 w-20 bg-slate-800 rounded" />
                                    </div>
                                    <div className="w-16 h-6 bg-slate-700 rounded" />
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {isError && (
                        <div className="py-10 text-center">
                            <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                            <p className="text-slate-400 text-base mb-2">Failed to Load Leaderboard</p>
                            <p className="text-sm text-slate-500">Please try again later</p>
                        </div>
                    )}
                    
                    {!isLoading && !isError && (!topPlayers || topPlayers.length === 0) && (
                        <div className="py-10 text-center">
                            <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                            <p className="text-slate-400 text-base mb-2">No Players Yet</p>
                            <p className="text-sm text-slate-500">Be the first to compete and climb the ranks</p>
                        </div>
                    )}

                    {!isLoading && !isError && topPlayers && topPlayers.length > 0 && (
                        <ul className="divide-y divide-slate-800">
                            {topPlayers.map((player, idx) => {
                                const rank = player.rank as keyof typeof rankProps;
                                const prop = rankProps[rank] || rankProps.Silver;
                                const position = idx + 1;
                                const positionStyle = getPositionStyle(position);
                                const isTop3 = position <= 3;
                                
                                return (
                                    <li key={player.user_id}>
                                        <button
                                            onClick={() => navigate(`/users/${player.user_id}`)}
                                            className="w-full flex items-center gap-4 py-6 px-8 bg-transparent hover:bg-blue-900/30 transition rounded-xl text-left"
                                        >
                                            {/* Position Number */}
                                            <div className="flex items-center gap-2 sm:gap-3 w-12 sm:w-16 flex-shrink-0">
                                                <span className={`text-lg sm:text-xl font-bold ${positionStyle?.color || prop.color}`}>
                                                    #{position}
                                                </span>
                                                {positionStyle && (
                                                    <div className="hidden sm:block">
                                                        {positionStyle.icon}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={getAvatar(player.avatar, player.display_name ?? player.username)}
                                                    alt={player.display_name ?? player.username}
                                                    className={`w-16 h-16 rounded-full object-cover border-2 border-slate-700 ${positionStyle?.ring || ''}`}
                                                />
                                                {positionStyle && (
                                                    <div className="absolute -bottom-1 -right-1 sm:hidden">
                                                        {positionStyle.icon}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Player Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className={`${isTop3 ? 'text-lg font-bold' : 'text-base font-semibold'} ${isTop3 ? 'text-blue-200' : 'text-white'} leading-tight truncate`}>
                                                        {player.display_name || player.username}
                                                    </span>
                                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${prop.bg} ${prop.color} text-xs font-medium flex-shrink-0`}>
                                                        {prop.icon}
                                                        {player.rank}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-400">
                                                    {player.elo_rating} ELO &bull;
                                                    <span className="ml-1.5 text-green-300">{player.wins}W</span>
                                                    <span className="ml-1.5 text-red-300">{player.losses}L</span>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
