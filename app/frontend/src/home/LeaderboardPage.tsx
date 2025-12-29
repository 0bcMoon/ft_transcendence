import { useGetTopPlayers, TopPlayer } from "@/game/api/queries"
import { Trophy, Medal, Crown } from "lucide-react"
import { Link } from "react-router-dom"

const getPlayerAvatar = (player: TopPlayer): string => {
    if (player.avatar) {
        return `${import.meta.env.VITE_API_URL}/public/${player.avatar}`
    }
    const name = player.display_name || player.username
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=200`
}

const calculateWinRate = (player: TopPlayer) => {
    const total = player.wins + player.losses
    return total > 0 ? Math.round((player.wins / total) * 100) : 0
}

export default function LeaderboardPage() {
    const { data: topPlayers, isLoading, isError } = useGetTopPlayers(25)

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400">Loading rankings...</p>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <p className="text-red-400 font-semibold mb-2">Failed to load leaderboard</p>
                    <p className="text-slate-400 text-sm">Please try again later</p>
                </div>
            </div>
        )
    }

    const topThree = topPlayers?.slice(0, 3) || []
    const restPlayers = topPlayers?.slice(3) || []

    const podiumOrder = topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree

    return (
        <div className="h-full overflow-y-auto bg-slate-950 py-6 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Trophy className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">Leaderboard</h1>
                            <p className="text-base text-slate-400 mt-1">Top players ranked by ELO rating</p>
                        </div>
                    </div>
                </div>

                {topThree.length > 0 && (
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            {podiumOrder.map((player) => {
                                const position = topThree.indexOf(player) + 1
                                const name = player.display_name || player.username
                                const winRate = calculateWinRate(player)

                                // Styling based on position
                                const isFirst = position === 1
                                const isSecond = position === 2
                                const isThird = position === 3

                                return (
                                    <Link
                                        key={player.user_id}
                                        to={`/users/${player.user_id}`}
                                        className={`
                      rounded-2xl bg-slate-900 shadow-xl p-6 hover:scale-105 transition-transform cursor-pointer
                      flex flex-col items-center text-center
                      ${isFirst ? "md:order-2 md:pt-0" : ""}
                      ${isSecond ? "md:order-1 md:pt-8" : ""}
                      ${isThird ? "md:order-3 md:pt-8" : ""}
                    `}
                                    >
                                        {/* Medal/Crown Icon */}
                                        <div className="mb-4">
                                            {isFirst && (
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                                                    <Crown className="w-8 h-8 text-white" />
                                                </div>
                                            )}
                                            {isSecond && (
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-lg">
                                                    <Medal className="w-7 h-7 text-white" />
                                                </div>
                                            )}
                                            {isThird && (
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
                                                    <Medal className="w-7 h-7 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Avatar */}
                                        <img
                                            src={getPlayerAvatar(player) || "/placeholder.svg"}
                                            alt={name}
                                            className={`rounded-full object-cover mb-3 ${isFirst ? "w-24 h-24" : "w-20 h-20"}`}
                                        />

                                        {/* Position Badge */}
                                        <div
                                            className={`
                      font-bold mb-2 px-3 py-1 rounded-full
                      ${isFirst ? "text-lg bg-yellow-500/20 text-yellow-400" : ""}
                      ${isSecond ? "text-base bg-slate-500/20 text-slate-300" : ""}
                      ${isThird ? "text-base bg-amber-600/20 text-amber-500" : ""}
                    `}
                                        >
                                            #{position}
                                        </div>

                                        {/* Player Name */}
                                        <h3 className={`font-bold text-white mb-1 ${isFirst ? "text-xl" : "text-lg"}`}>{name}</h3>

                                        {/* Rank Badge */}
                                        <span
                                            className={`
                      px-3 py-1 text-xs font-semibold rounded-md mb-3
                      ${isFirst ? "bg-blue-500/30 text-blue-300" : "bg-slate-700 text-slate-300"}
                    `}
                                        >
                                            {player.rank}
                                        </span>

                                        {/* Stats */}
                                        <div className="space-y-2 w-full">
                                            <div className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-2">
                                                <span className="text-sm text-slate-400">ELO</span>
                                                <span className="text-base font-bold text-blue-300">{player.elo_rating}</span>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-2">
                                                <span className="text-sm text-slate-400">Record</span>
                                                <span className="text-sm font-semibold text-white">
                                                    <span className="text-green-400">{player.wins}W</span>
                                                    <span className="text-slate-500 mx-1">/</span>
                                                    <span className="text-red-400">{player.losses}L</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-2">
                                                <span className="text-sm text-slate-400">Win Rate</span>
                                                <span className="text-base font-bold text-white">{winRate}%</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}

                {restPlayers.length > 0 && (
                    <div className="rounded-2xl bg-slate-900 shadow-xl overflow-hidden">
                        {restPlayers.map((player, idx) => {
                            const position = idx + 4
                            const name = player.display_name || player.username
                            const winRate = calculateWinRate(player)

                            return (
                                <Link
                                    key={player.user_id}
                                    to={`/users/${player.user_id}`}
                                    className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 hover:bg-blue-900/30 transition-colors cursor-pointer"
                                >
                                    <div className="w-10 sm:w-12 flex-shrink-0 flex items-center justify-center">
                                        <span className="text-lg sm:text-xl font-bold text-slate-400">#{position}</span>
                                    </div>

                                    <img
                                        src={getPlayerAvatar(player) || "/placeholder.svg"}
                                        alt={name}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm sm:text-base font-semibold text-white truncate">{name}</h3>
                                            <span className="px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-md">
                                                {player.rank}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400">
                                            <span className="font-semibold text-slate-300">{player.elo_rating} ELO</span>
                                            <span className="text-green-400">{player.wins}W</span>
                                            <span className="text-red-400">{player.losses}L</span>
                                            <span className="hidden sm:inline text-slate-400">{winRate}%</span>
                                        </div>
                                    </div>

                                    <div className="sm:hidden flex-shrink-0 text-right">
                                        <div className="text-sm font-semibold text-white">{winRate}%</div>
                                        <div className="text-xs text-slate-400">WR</div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}

                {/* Empty State */}
                {topPlayers?.length === 0 && (
                    <div className="rounded-2xl bg-slate-900 shadow-xl p-16 text-center">
                        <Trophy className="w-12 h-12 text-slate-600 mb-3 mx-auto" />
                        <p className="text-white font-semibold mb-1">No players yet</p>
                        <p className="text-slate-400 text-sm">Be the first to compete!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

