import { Link } from "react-router-dom"
import { useGetTopPlayers } from "@/game/api/queries"
import { Medal, Gem, Crown } from "lucide-react"

const rankProps = {
    Bronze: {
        color: "#b87333",
        text: "text-orange-400",
        bg: "bg-orange-100/10",
        icon: <Medal className="w-4 h-4" color="#b87333" strokeWidth={2.5} />,
    },
    Silver: {
        color: "#C0C0C0",
        text: "text-slate-300",
        bg: "bg-slate-100/10",
        icon: <Medal className="w-4 h-4" color="#C0C0C0" strokeWidth={2.5} />,
    },
    Gold: {
        color: "#FFD700",
        text: "text-yellow-200",
        bg: "bg-yellow-100/10",
        icon: <Medal className="w-4 h-4" color="#FFD700" strokeWidth={2.5} />,
    },
    Platinum: {
        color: "#60e6d0",
        text: "text-teal-200",
        bg: "bg-teal-100/10",
        icon: <Gem className="w-4 h-4" color="#60e6d0" strokeWidth={2.5} />,
    },
    Master: {
        color: "#a78bfa",
        text: "text-indigo-300",
        bg: "bg-indigo-100/10",
        icon: <Crown className="w-4 h-4" color="#a78bfa" strokeWidth={2.5} />,
    },
}

const getAvatar = (avatar: string | null, name: string) =>
    avatar
        ? `${import.meta.env.VITE_API_URL}/public/${avatar}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=64`

export default function TopPlayers() {
    const { data: topPlayers, isLoading, isError } = useGetTopPlayers(6)

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl lg:text-2xl font-bold text-white">Top Players</h2>
                <Link to="/leaderboard" className="text-blue-400 hover:text-blue-300 font-semibold text-sm px-3 transition">
                    See leaderboard &rarr;
                </Link>
            </div>
            <div className="rounded-2xl bg-slate-900 p-0 shadow-xl border border-slate-800 overflow-hidden">
                <ul className="divide-y divide-slate-800">
                    {isLoading && <li className="py-8 text-slate-400 text-center">Loading top players…</li>}
                    {isError && <li className="py-8 text-red-400 text-center">Could not load top players.</li>}
                    {!isLoading && !isError && topPlayers?.length === 0 && (
                        <li className="py-8 text-slate-400 text-center">No top players found.</li>
                    )}
                    {!isLoading &&
                        !isError &&
                        topPlayers?.map((player, index) => {
                            const { text, bg, icon } = rankProps[player.rank as keyof typeof rankProps] || rankProps.Silver
                            return (
                                <li
                                    key={player.user_id}
                                    className="flex items-center justify-between py-4 px-6 bg-transparent hover:bg-blue-900/30 transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <Link
                                            to={`/users/${player.user_id}`}
                                            className="flex items-center gap-4 group"
                                            title={`View ${player.display_name || player.username}'s profile`}
                                        >
                                            <img
                                                src={getAvatar(player.avatar, player.display_name || player.username)}
                                                alt={player.display_name || player.username}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:ring-2 group-hover:ring-blue-400 transition"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-base font-semibold text-white group-hover:text-blue-300 transition">
                                                        {player.display_name || player.username}
                                                    </span>
                                                    <span
                                                        className={`flex items-center gap-1 px-2 py-0.5 rounded ${bg} ${text} text-xs font-medium`}
                                                    >
                                                        {icon}
                                                        {player.rank}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    {player.elo_rating} ELO
                                                    <span className="ml-2 text-green-300">{player.wins}W</span>
                                                    <span className="ml-2 text-red-300">{player.losses}L</span>
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                    <span className={`text-lg font-bold ${text}`}>#{index + 1}</span>
                                </li>
                            )
                        })}
                </ul>
            </div>
        </section>
    )
}

