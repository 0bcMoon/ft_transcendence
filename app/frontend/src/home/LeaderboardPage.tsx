import { useGetTopPlayers } from "@/game/api/queries";
import { Medal, Gem, Crown } from "lucide-react";

const rankProps = {
    Bronze: { color: "text-orange-400", bg: "bg-orange-100/10", icon: <Medal color="#b87333" className="w-4 h-4" /> },
    Silver: { color: "text-slate-300", bg: "bg-slate-100/10", icon: <Medal color="#C0C0C0" className="w-4 h-4" /> },
    Gold: { color: "text-yellow-200", bg: "bg-yellow-100/10", icon: <Medal color="#FFD700" className="w-4 h-4" /> },
    Platinum: { color: "text-teal-200", bg: "bg-teal-100/10", icon: <Gem color="#60e6d0" className="w-4 h-4" /> },
    Master: { color: "text-indigo-300", bg: "bg-indigo-100/10", icon: <Crown color="#a78bfa" className="w-4 h-4" /> }
};

const podiumColor = [
    "bg-slate-900",
    "bg-yellow-900/80",
    "bg-orange-900/60"
];
const medalIcon = [
    <Medal className="w-7 h-7 text-slate-300" key="2" />,
    <Crown className="w-8 h-8 text-yellow-300" key="1" />,
    <Medal className="w-7 h-7 text-orange-400" key="3" />
];

const getAvatar = (avatar: string | null, name: string) =>
    avatar
        ? `${import.meta.env.VITE_API_URL}/public/${avatar}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=96`;

export default function LeaderboardPage() {
    const { data: topPlayers, isLoading, isError } = useGetTopPlayers(25);
    const top3 = topPlayers?.slice(0, 3) ?? [];
    const rest = topPlayers?.slice(3) ?? [];

    return (
        <div className="h-full overflow-y-auto bg-slate-950 no-scrollbar flex items-start justify-center py-20 px-8">
            <div className="max-w-7xl w-full">
                <h1 className="text-4xl font-bold text-center text-white mb-3 tracking-tight">
                    Leaderboard
                </h1>
                <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto text-center">
                    Play <span className="text-blue-300 font-bold">1v1 matches</span>, compete in <span className="text-sky-300 font-semibold">live tournaments</span>, and climb the <span className="text-blue-200 font-bold">global leaderboard</span>.<br />
                    Challenge others, improve your rank, and make your mark!
                </p>
                {/* Podium */}
                {!isLoading && !isError && top3.length > 0 && (
                    <div className="mb-12 flex justify-center items-end gap-2 sm:gap-8 max-w-2xl mx-auto w-full min-h-[175px]">
                        {/* #2 */}
                        {top3[1] && (
                            <div className={`flex-1 flex flex-col items-center justify-end ${podiumColor[0]} rounded-2xl py-4 sm:py-6 shadow-lg`}>
                                <span className="font-bold text-lg text-slate-300 mb-1">#2</span>
                                <img
                                    src={getAvatar(top3[1].avatar, top3[1].display_name ?? top3[1].username)}
                                    alt={top3[1].display_name || top3[1].username}
                                    className="w-16 h-16 rounded-full object-cover mb-2 ring-2 ring-slate-300"
                                />
                                {medalIcon[0]}
                                <span className="mt-2 text-base font-semibold text-white">{top3[1].display_name || top3[1].username}</span>
                                <span className="text-xs text-slate-400">{top3[1].elo_rating} ELO</span>
                            </div>
                        )}
                        {/* #1 */}
                        {top3[0] && (
                            <div className={`flex-1 flex flex-col items-center justify-end z-10 ${podiumColor[1]} rounded-2xl py-6 sm:py-9 shadow-xl scale-110`}>
                                <span className="font-bold text-2xl text-yellow-300 mb-1 drop-shadow">#1</span>
                                <img
                                    src={getAvatar(top3[0].avatar, top3[0].display_name ?? top3[0].username)}
                                    alt={top3[0].display_name || top3[0].username}
                                    className="w-20 h-20 rounded-full object-cover mb-2 ring-4 ring-yellow-300"
                                />
                                {medalIcon[1]}
                                <span className="mt-2 text-lg font-bold text-white">{top3[0].display_name || top3[0].username}</span>
                                <span className="text-sm text-slate-200">{top3[0].elo_rating} ELO</span>
                            </div>
                        )}
                        {/* #3 */}
                        {top3[2] && (
                            <div className={`flex-1 flex flex-col items-center justify-end ${podiumColor[2]} rounded-2xl py-3 sm:py-5 shadow-md`}>
                                <span className="font-bold text-base text-orange-400 mb-1">#3</span>
                                <img
                                    src={getAvatar(top3[2].avatar, top3[2].display_name ?? top3[2].username)}
                                    alt={top3[2].display_name || top3[2].username}
                                    className="w-14 h-14 rounded-full object-cover mb-2 ring-2 ring-orange-400"
                                />
                                {medalIcon[2]}
                                <span className="mt-2 text-base font-semibold text-white">{top3[2].display_name || top3[2].username}</span>
                                <span className="text-xs text-slate-400">{top3[2].elo_rating} ELO</span>
                            </div>
                        )}
                    </div>
                )}
                {/* List */}
                <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-800 overflow-hidden">
                    <ul className="divide-y divide-slate-800">
                        {isLoading && (
                            <li className="py-10 text-slate-400 text-center">Loading leaderboard…</li>
                        )}
                        {isError && (
                            <li className="py-10 text-red-400 text-center">Could not load leaderboard.</li>
                        )}
                        {!isLoading && !isError && rest.length === 0 && top3.length === 0 && (
                            <li className="py-10 text-slate-400 text-center">No top players to show yet.</li>
                        )}
                        {!isLoading && !isError && rest.map((player, idx) => {
                            const rank = player.rank as keyof typeof rankProps;
                            const prop = rankProps[rank] || rankProps.Silver;
                            const pos = idx + 4; // because rest starts after top 3
                            return (
                                <li
                                    key={player.user_id}
                                    className="flex items-center gap-5 py-4 sm:py-5 px-2 sm:px-6"
                                >
                                    <span className={`w-8 text-center text-lg font-bold ${prop.color}`}>#{pos}</span>
                                    <img
                                        src={getAvatar(player.avatar, player.display_name ?? player.username)}
                                        alt={player.display_name ?? player.username}
                                        className="w-11 h-11 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-base font-semibold text-white leading-tight">{player.display_name || player.username}</span>
                                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${prop.bg} ${prop.color} text-xs font-medium`}>
                                                {prop.icon}
                                                {player.rank}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {player.elo_rating} ELO &ndash;
                                            <span className="ml-1 text-green-300">{player.wins}W</span>
                                            <span className="ml-2 text-red-300">{player.losses}L</span>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
