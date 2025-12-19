import { useNavigate } from "react-router-dom"
import { Trophy, Bot } from "lucide-react"
import type { GamePlayerDetail } from "@/game/api/gameApi"

interface PlayerCardProps {
    player: GamePlayerDetail
    isWinner: boolean
}

export default function PlayerCard({ player, isWinner }: PlayerCardProps) {
    const navigate = useNavigate()
    console.log(player.profile_picture)

    const getAvatar = () => {
        if (player.profile_picture) {
            return `${import.meta.env.VITE_API_URL}/public/${player.profile_picture}`
        }
        const name = player.display_name || player.username || "AI Player"
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=160`
    }

    const avatar = getAvatar()
    const displayName = player.display_name || player.username || (player.is_ai ? "AI Player" : "Unknown Player")
    const isClickable = player.user_id && !player.is_ai

    return (
        <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="relative mb-3">
                <img
                    src={avatar || "/placeholder.svg"}
                    alt={displayName}
                    onClick={() => isClickable && navigate(`/users/${player.user_id}`)}
                    className={`w-28 h-28 md:w-32 md:h-32 rounded-full object-cover transition-all ${isClickable ? "cursor-pointer hover:opacity-80" : ""
                        } ${isWinner ? "ring-4 ring-green-500" : "ring-4 ring-slate-700"}`}
                    onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=160`
                    }}
                />
                {isWinner && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                        <Trophy size={18} className="text-slate-900" />
                    </div>
                )}
                {player.is_ai && (
                    <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1.5">
                        <Bot size={14} className="text-white" />
                    </div>
                )}
            </div>

            {/* Player Name */}
            <h3
                onClick={() => isClickable && navigate(`/users/${player.user_id}`)}
                className={`text-lg md:text-xl font-semibold text-white text-center ${isClickable ? "cursor-pointer hover:text-blue-400 transition-colors" : ""
                    }`}
            >
                {displayName}
            </h3>
            {player.username && player.display_name && player.username !== player.display_name && (
                <p className="text-slate-400 text-xs md:text-sm mt-0.5">@{player.username}</p>
            )}

            {/* Score */}
            <p className={`mt-2 text-3xl md:text-4xl font-bold ${isWinner ? "text-green-400" : "text-slate-400"}`}>
                {player.score ?? 0}
            </p>

            {/* ELO Change */}
            {player.new_elo !== null && player.elo_change !== null && (
                <div className="mt-3 flex flex-col items-center gap-1">
                    <div className="text-slate-400 text-xs">
                        New ELO: <span className="text-white font-medium">{player.new_elo}</span>
                    </div>
                    <div
                        className={`text-sm font-semibold ${player.elo_change > 0 ? "text-green-400" : player.elo_change < 0 ? "text-red-400" : "text-yellow-400"
                            }`}
                    >
                        {player.elo_change >= 0 ? "+" : ""}
                        {player.elo_change}
                    </div>
                </div>
            )}
        </div>
    )
}

