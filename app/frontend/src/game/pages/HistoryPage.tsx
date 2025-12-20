import { useNavigate, Link } from "react-router-dom"
import { History, ArrowLeft, Gamepad2 } from "lucide-react"
import { useAuthStore } from "@/state/authStore"
import { useGetGlobalMatches } from "@/game/api/queries"
import type { GlobalMatchData } from "@/game/types/types"

function HistoryPage() {
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)
    const { data: matches = [], isLoading } = useGetGlobalMatches()

    const getWinner = (match: GlobalMatchData) => {
        if (match.player1_score > match.player2_score) return "p1"
        if (match.player2_score > match.player1_score) return "p2"
        return "draw"
    }

    const getAvatar = (avatar: string | null, name: string) =>
        avatar
            ? `${import.meta.env.VITE_API_URL}/public/${avatar}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=64`

    const getModeLabel = (mode: string) => {
        const labels = { remote: "1v1", local: "Local", ai: "AI", tournament: "Tournament" }
        return labels[mode as keyof typeof labels] || mode
    }

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-slate-950 py-6 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-slate-400 
                               hover:text-white hover:bg-slate-900 
                               rounded-lg transition-all font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <History className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">Match History</h1>
                            <p className="text-base text-slate-400 mt-1">
                                {matches.length || 0} {matches.length === 1 ? "match" : "matches"} played
                            </p>
                        </div>
                    </div>
                </div>

                {/* Match List */}
                <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-800 overflow-hidden p-0">
                    {isLoading && (
                        <div className="space-y-3 p-6">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 py-6 px-8 rounded-xl bg-slate-800/60 animate-pulse">
                                    <div className="w-16 h-16 rounded-full bg-slate-700" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-32 bg-slate-700 rounded" />
                                        <div className="h-3 w-20 bg-slate-800 rounded" />
                                    </div>
                                    <div className="w-16 h-6 bg-slate-700 rounded" />
                                    <div className="w-16 h-16 rounded-full bg-slate-700" />
                                </div>
                            ))}
                        </div>
                    )}
                    {!isLoading && matches.length > 0 && (
                        <ul className="divide-y divide-slate-800">
                            {matches.map((match) => {
                                const winner = getWinner(match)
                                const p1Win = winner === "p1"
                                const p2Win = winner === "p2"
                                const isPlayer1 = match.player1_name === user?.username
                                const userName = isPlayer1 ? match.player1_name : match.player2_name
                                const userAvatar = isPlayer1 ? match.player1_avatar : match.player2_avatar
                                const opponentName = isPlayer1 ? match.player2_name : match.player1_name
                                const opponentAvatar = isPlayer1 ? match.player2_avatar : match.player1_avatar
                                const userScore = isPlayer1 ? match.player1_score : match.player2_score
                                const opponentScore = isPlayer1 ? match.player2_score : match.player1_score
                                const isWin = isPlayer1 ? p1Win : p2Win

                                return (
                                    <li key={match.matchId}>
                                        <Link
                                            to={`/history/${match.matchId}`}
                                            className="flex items-center gap-4 py-6 px-8 bg-transparent hover:bg-blue-900/30 transition rounded-xl block"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <img
                                                    src={getAvatar(userAvatar, userName) || "/placeholder.svg"}
                                                    alt={userName}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                                                />
                                                <div>
                                                    <p
                                                        className={`text-base font-semibold ${isWin ? "text-blue-200" : "text-slate-400"} transition`}
                                                    >
                                                        {userName}
                                                    </p>
                                                    <p className="text-sm text-slate-400">
                                                        {getModeLabel(match.mode)} &bull; {match.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="font-extrabold text-2xl mx-3 flex-shrink-0">
                                                <span className={isWin ? "text-blue-300" : "text-slate-400"}>{userScore}</span>
                                                <span className="mx-2 text-slate-500">-</span>
                                                <span className={!isWin ? "text-blue-300" : "text-slate-400"}>{opponentScore}</span>
                                            </div>
                                            <div className="flex items-center gap-4 flex-1 justify-end">
                                                <div className="text-right">
                                                    <p
                                                        className={`text-base font-semibold ${!isWin ? "text-blue-200" : "text-slate-400"} transition`}
                                                    >
                                                        {opponentName}
                                                    </p>
                                                    <p className="text-sm text-slate-400">Opponent</p>
                                                </div>
                                                <img
                                                    src={getAvatar(opponentAvatar, opponentName) || "/placeholder.svg"}
                                                    alt={opponentName}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                                                />
                                            </div>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                    {!isLoading && matches.length === 0 && (
                        <div className="py-10 text-center">
                            <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                            <p className="text-slate-400 text-base mb-2">No Matches Yet</p>
                            <p className="text-sm text-slate-500 mb-4">Start playing to see your match history</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HistoryPage

