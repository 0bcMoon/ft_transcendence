import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Trophy, Clock, Calendar, Target, Loader2, XCircle } from "lucide-react"
import { useGetGameDetail, useGetGamePlayers } from "@/game/api/queries"
import PlayerCard from "../components/PlayerCard"

export default function MatchDetailsPage() {
    const { matchId } = useParams<{ matchId: string }>()
    const navigate = useNavigate()
    const gameId = Number(matchId)

    const { data: gameDetails, isLoading: loadingGame, isError: errorGame } = useGetGameDetail(gameId)
    const { data: players, isLoading: loadingPlayers, isError: errorPlayers } = useGetGamePlayers(gameId)

    const isLoading = loadingGame || loadingPlayers
    const isError = errorGame || errorPlayers

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-white" size={32} />
                    <p className="text-slate-400">Loading match details...</p>
                </div>
            </div>
        )
    }

    if (isError || !gameDetails || !players) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-white text-xl font-semibold mb-4">Match not found</p>
                    <p className="text-slate-400 mb-6">Unable to load match details.</p>
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

    const player1 = players.find((p) => p.position === 1)
    const player2 = players.find((p) => p.position === 2)
    const isPlayer1Winner = player1?.user_id && gameDetails.winner_id === player1.user_id
    const isPlayer2Winner = player2?.user_id && gameDetails.winner_id === player2.user_id

    const getDuration = () => {
        if (!gameDetails.started_at || !gameDetails.ended_at) return "N/A"
        const start = new Date(gameDetails.started_at).getTime()
        const end = new Date(gameDetails.ended_at).getTime()
        const minutes = Math.floor((end - start) / 60000)
        const seconds = Math.floor(((end - start) % 60000) / 1000)
        return `${minutes}m ${seconds}s`
    }

    return (
        <div className="h-full overflow-y-auto  bg-slate-950 py-6 md:py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all font-medium" >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Match Details</h1>
                    <p className="text-slate-400 text-sm md:text-base">
                        {gameDetails.status === "finished" ? "Completed Match" : "Ongoing Match"}
                    </p>
                </div>

                {/* Players Card - Responsive Grid */}
                <div className="bg-slate-900 rounded-2xl p-6 md:p-8 mb-6 border border-slate-800">
                    <div className="flex flex-col md:grid md:grid-cols-3 gap-8 md:gap-6 items-center">
                        {player1 && <PlayerCard player={player1} isWinner={!!isPlayer1Winner} />}

                        {/* VS Badge */}
                        <div className="flex flex-col items-center justify-center order-first md:order-none">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800 flex items-center justify-center mb-2 md:mb-3">
                                <span className="text-xl md:text-2xl font-bold text-white">VS</span>
                            </div>
                            <p className="text-xs md:text-sm text-slate-500 uppercase font-medium tracking-wider">
                                {gameDetails.mode}
                            </p>
                        </div>

                        {player2 && <PlayerCard player={player2} isWinner={!!isPlayer2Winner} />}
                    </div>
                </div>

                {/* Match Information */}
                <div className="bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-800">
                    <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">Match Information</h2>
                    <div className="space-y-3">
                        {/* Date */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-slate-400" />
                                <span className="text-sm md:text-base text-slate-400">Date</span>
                            </div>
                            <span className="text-sm md:text-base font-medium text-white">
                                {new Date(gameDetails.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-slate-400" />
                                <span className="text-sm md:text-base text-slate-400">Duration</span>
                            </div>
                            <span className="text-sm md:text-base font-medium text-white">{getDuration()}</span>
                        </div>

                        {/* Game Mode */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Target size={20} className="text-slate-400" />
                                <span className="text-sm md:text-base text-slate-400">Game Mode</span>
                            </div>
                            <span className="text-sm md:text-base font-medium text-white capitalize">{gameDetails.mode}</span>
                        </div>

                        {/* Match ID */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Trophy size={20} className="text-slate-400" />
                                <span className="text-sm md:text-base text-slate-400">Match ID</span>
                            </div>
                            <span className="text-sm md:text-base font-medium text-white">#{gameDetails.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

