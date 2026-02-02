import { useGetTopPlayers } from "@/game/hooks/queries"
import { Trophy } from "lucide-react"
import { Link } from "react-router-dom"

export default function LeaderboardPage() {
    const { data: topPlayers = [], isLoading, isError } = useGetTopPlayers(50)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm sm:text-base">
                        Loading leaderboard...
                    </p>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <p className="text-red-400 font-semibold text-base sm:text-lg">
                    Failed to load leaderboard
                </p>
            </div>
        )
    }

    if (topPlayers.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-white font-semibold text-base sm:text-lg">
                        No players yet
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 py-8 sm:py-10 px-3 sm:px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg">
                        <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                        Leaderboard
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base">
                        Top players ranked by total XP
                    </p>
                </div>

                {/* Players */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    {topPlayers.map((player, index) => (
                        <Link
                            key={player.id}
                            to={`/users/${player.id}`}
                            className="
                                group flex items-center gap-4 sm:gap-6
                                px-4 sm:px-6 py-4 sm:py-5
                                border-b border-slate-800 last:border-none
                                hover:bg-slate-800/70
                                transition-all " >

                            {/* Rank */}
                            <div className="
                                w-8 sm:w-12 text-center font-bold
                                text-sm sm:text-lg
                                text-slate-400 ">
                                #{index + 1}
                            </div>

                            {/* Avatar */}
                            <img
                                src={player.profile_picture || "/placeholder.svg"}
                                alt={player.username}
                                className="
                                    w-10 h-10 sm:w-14 sm:h-14
                                    rounded-full object-cover
                                    border-2 border-slate-700
                                    group-hover:border-blue-500
                                    transition " />

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-white font-semibold text-sm sm:text-lg truncate">
                                        {player.username}
                                    </p>

                                    {player.badge_icon && (
                                        <span
                                            className="
                                                inline-flex items-center gap-1
                                                px-2 py-0.5
                                                rounded-full
                                                bg-blue-500/10
                                                border border-blue-500/20
                                                text-blue-300
                                                text-xs sm:text-sm
                                                font-medium "
                                            title={player.badge_name ?? "Badge"} >
                                            <span className="text-base">
                                                {player.badge_icon}
                                            </span>
                                            <span className="hidden sm:inline">
                                                {player.badge_name}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* XP */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-purple-400 font-bold text-sm sm:text-lg">
                                    {player.total_xp} XP
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
