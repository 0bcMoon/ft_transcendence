import { Link } from "react-router-dom"
import { Trophy, TrendingUp } from "lucide-react"

interface PlayerCardProps {
    playerId: number
    username: string
    avatar: string
    score: number
    xpGained: number
    isWinner: boolean
}

export function PlayerCard({
    playerId,
    username,
    avatar,
    score,
    xpGained,
    isWinner,
}: PlayerCardProps) {
    return (
        <Link
            to={`/users/${playerId}`}
            className="
                flex flex-col items-center text-center
                rounded-2xl p-4 sm:p-6
                bg-slate-900 border border-slate-800
                hover:bg-slate-800 transition
            "
        >
            {/* Avatar circle */}
            <div className="relative mb-3 sm:mb-4">
                <img
                    src={avatar}
                    alt={username}
                    className={`
                        w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                        rounded-full object-cover
                        border-4
                        ${isWinner ? "border-yellow-400" : "border-slate-700"}
                    `}
                />

                {isWinner && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                        <Trophy className="w-4 h-4 text-slate-900" />
                    </div>
                )}
            </div>

            {/* Username */}
            <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg truncate max-w-full">
                {username}
            </h3>

            {/* Score */}
            <div className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400">
                {score}
            </div>

            {/* XP */}
            <div className="mt-1 flex items-center gap-1 text-green-400 text-xs sm:text-sm font-medium">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                +{xpGained} XP
            </div>
        </Link>
    )
}

interface InfoRowProps {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
}

export function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
    return (
        <div className="flex items-center justify-between rounded-xl bg-slate-800/50 px-4 py-3">
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-sm">{label}</span>
            </div>

            <span className="text-white font-medium text-sm capitalize">
                {value}
            </span>
        </div>
    )
}

