import { useNavigate, useParams } from "react-router-dom"
import { useAuthStore } from "@/state/authStore"
import { ArrowLeft, Trophy, Clock, Calendar, Target, Loader2, XCircle } from "lucide-react"
import { useGetGameDetails } from "@/game/api/queries"

function PlayerCard({
    name,
    avatar,
    score,
    isWinner,
    userId,
}: {
    name: string
    avatar: string
    score: number
    isWinner: boolean
    userId?: number
}) {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <img
                    src={`${import.meta.env.VITE_API_URL}/public/${avatar}`}
                    alt={name}
                    onClick={() => userId && navigate(`/users/${userId}`)}
                    className={`w-32 h-32 rounded-full object-cover transition-all ${userId ? "cursor-pointer hover:opacity-80" : ""
                        } ${isWinner ? "ring-4 ring-green-500" : "ring-4 ring-slate-700"}`}
                    onError={(e) =>
                        (e.currentTarget.src = `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff&size=128`)
                    }
                />
                {isWinner && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2.5">
                        <Trophy size={20} className="text-slate-900" />
                    </div>
                )}
            </div>
            <h3
                onClick={() => userId && navigate(`/profile/${userId}`)}
                className={`mt-4 text-xl font-semibold text-white ${userId ? "cursor-pointer hover:text-blue-400 transition-colors" : ""
                    }`}
            >
                {name}
            </h3>
            <p className={`mt-2 text-4xl font-bold ${isWinner ? "text-green-400" : "text-slate-400"}`}>{score}</p>
        </div>
    )
}

export default function MatchDetailsPage() {
    const { matchId } = useParams<{ matchId: string }>()
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)
    const gameId = Number(matchId)

    const { data: gameDetails, isLoading, isError } = useGetGameDetails(gameId)
    console.log(gameDetails)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-white" size={32} />
                    <p className="text-slate-400">Loading match details...</p>
                </div>
            </div>
        )
    }

    if (isError || !gameDetails) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-white text-lg font-semibold mb-4">Match not found</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    const userPlayer = gameDetails.players.find((p) => p.user_id === user?.id) || gameDetails.players[0]
    const opponentPlayer = gameDetails.players.find((p) => p.user_id !== user?.id) || gameDetails.players[1]
    const isWin = gameDetails.winner_id === userPlayer?.user_id

    let duration = "N/A"
    if (gameDetails.started_at && gameDetails.ended_at) {
        const start = new Date(gameDetails.started_at).getTime()
        const end = new Date(gameDetails.ended_at).getTime()
        const minutes = Math.floor((end - start) / 60000)
        const seconds = Math.floor(((end - start) % 60000) / 1000)
        duration = `${minutes}m ${seconds}s`
    }

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Match Details</h1>
                    <p className={`text-xl font-medium ${isWin ? "text-green-400" : "text-red-400"}`}>
                        {isWin ? "Victory" : "Defeat"}
                    </p>
                </div>

                {/* Players Card */}
                <div className="bg-slate-900 rounded-2xl p-10 mb-6 border border-slate-800">
                    <div className="grid grid-cols-3 gap-8 items-center">
                        <PlayerCard
                            name={userPlayer?.username || "Player 1"}
                            avatar={userPlayer?.avatar || ""}
                            score={userPlayer?.score ?? 0}
                            isWinner={isWin}
                            userId={userPlayer?.user_id || undefined}
                        />

                        <div className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                                <span className="text-2xl font-bold text-white">VS</span>
                            </div>
                            <p className="text-sm text-slate-500 uppercase font-medium">{gameDetails.mode}</p>
                        </div>

                        <PlayerCard
                            name={opponentPlayer?.username || "Player 2"}
                            avatar={opponentPlayer?.avatar || ""}
                            score={opponentPlayer?.score ?? 0}
                            isWinner={!isWin}
                            userId={opponentPlayer?.user_id || undefined}
                        />
                    </div>
                </div>

                {/* Match Info */}
                <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                    <h2 className="text-xl font-semibold text-white mb-6">Match Information</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-slate-400" />
                                <span className="text-base text-slate-400">Date</span>
                            </div>
                            <span className="text-base font-medium text-white">
                                {new Date(gameDetails.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-slate-400" />
                                <span className="text-base text-slate-400">Duration</span>
                            </div>
                            <span className="text-base font-medium text-white">{duration}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Target size={20} className="text-slate-400" />
                                <span className="text-base text-slate-400">Game Mode</span>
                            </div>
                            <span className="text-base font-medium text-white">{gameDetails.mode}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Trophy size={20} className="text-slate-400" />
                                <span className="text-base text-slate-400">Match ID</span>
                            </div>
                            <span className="text-base font-medium text-white">#{gameDetails.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

