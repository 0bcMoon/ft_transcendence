import { Medal, Gem, Crown, Trophy } from "lucide-react";
import { useGetTopPlayers } from "@/game/api/queries";

const rankConfig = {
    Bronze: { color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Medal, iconColor: "#d97706" },
    Silver: { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", icon: Medal, iconColor: "#94a3b8" },
    Gold: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Medal, iconColor: "#facc15" },
    Platinum: { color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: Gem, iconColor: "#22d3ee" },
    Master: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: Crown, iconColor: "#c084fc" }
};

const getAvatar = (avatar: string | null, name: string) =>
    avatar
        ? `${import.meta.env.VITE_API_URL}/public/${avatar}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=96`;

export default function LeaderboardPage() {
    const { data: topPlayers, isLoading, isError } = useGetTopPlayers(25);

    const top3 = topPlayers?.slice(0, 3) ?? [];
    const rest = topPlayers?.slice(3) ?? [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-red-400">Failed to load leaderboard</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
                        Leaderboard
                    </h1>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                        Compete, climb, and conquer the ranks
                    </p>
                </div>

                {/* Top 3 Podium */}
                {top3.length > 0 && (
                    <div className="mb-16 grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {/* Second Place */}
                        <div className="flex flex-col items-center pt-12">
                            <div className="relative">
                                <img
                                    src={getAvatar(top3[1]?.avatar, top3[1]?.display_name ?? top3[1]?.username)}
                                    alt={top3[1]?.display_name || top3[1]?.username}
                                    className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-600"
                                />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-base font-bold">
                                    2
                                </div>
                            </div>
                            <h3 className="mt-5 text-white font-semibold text-base truncate w-full text-center">
                                {top3[1]?.display_name || top3[1]?.username}
                            </h3>
                            <p className="text-slate-400 text-sm">{top3[1]?.elo_rating} ELO</p>
                        </div>

                        {/* First Place */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <img
                                    src={getAvatar(top3[0]?.avatar, top3[0]?.display_name ?? top3[0]?.username)}
                                    alt={top3[0]?.display_name || top3[0]?.username}
                                    className="w-32 h-32 rounded-full object-cover ring-4 ring-yellow-400"
                                />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-br from-yellow-400 to-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                                    1
                                </div>
                                <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400" />
                            </div>
                            <h3 className="mt-5 text-white font-bold text-xl truncate w-full text-center">
                                {top3[0]?.display_name || top3[0]?.username}
                            </h3>
                            <p className="text-slate-300 text-base font-medium">{top3[0]?.elo_rating} ELO</p>
                        </div>

                        {/* Third Place */}
                        <div className="flex flex-col items-center pt-12">
                            <div className="relative">
                                <img
                                    src={getAvatar(top3[2]?.avatar, top3[2]?.display_name ?? top3[2]?.username)}
                                    alt={top3[2]?.display_name || top3[2]?.username}
                                    className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-700"
                                />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-base font-bold">
                                    3
                                </div>
                            </div>
                            <h3 className="mt-5 text-white font-semibold text-base truncate w-full text-center">
                                {top3[2]?.display_name || top3[2]?.username}
                            </h3>
                            <p className="text-slate-400 text-sm">{top3[2]?.elo_rating} ELO</p>
                        </div>
                    </div>
                )}

                {/* Rankings List */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden">
                    {rest.map((player, idx) => {
                        const rank = player.rank as keyof typeof rankConfig;
                        const config = rankConfig[rank] || rankConfig.Silver;
                        const Icon = config.icon;
                        const position = idx + 4;

                        return (
                            <div
                                key={player.user_id}
                                className="flex items-center gap-5 p-5 hover:bg-slate-800/50 transition-colors border-b border-slate-800 last:border-b-0"
                            >
                                <div className="w-10 text-center">
                                    <span className="text-slate-400 font-semibold text-base">{position}</span>
                                </div>

                                <img
                                    src={getAvatar(player.avatar, player.display_name ?? player.username)}
                                    alt={player.display_name ?? player.username}
                                    className="w-14 h-14 rounded-full object-cover"
                                />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-medium truncate text-base">
                                            {player.display_name || player.username}
                                        </span>
                                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
                                            <Icon className="w-3.5 h-3.5" />
                                            {player.rank}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span>{player.elo_rating} ELO</span>
                                        <span className="text-green-400">{player.wins}W</span>
                                        <span className="text-red-400">{player.losses}L</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
