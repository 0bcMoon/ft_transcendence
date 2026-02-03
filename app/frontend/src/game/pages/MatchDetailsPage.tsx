import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Trophy, Clock, Target, Loader2, AlertCircle } from "lucide-react";
import { useGetGameDetail } from "@/game/hooks/queries";
import { PlayerCard } from "@/game/components/PlayerCard";
import { InfoRow } from "@/game/components/PlayerCard";

export default function MatchDetailsPage() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const { data: match, isLoading, isError } = useGetGameDetail(Number(matchId));

    const getDuration = () => {
        if (!match?.started_at || !match?.ended_at) return "N/A";
        const duration = new Date(match.ended_at).getTime() - new Date(match.started_at).getTime();
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (isError || !match) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <p className="text-xl text-slate-300">Match not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-6 sm:py-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition" >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Match Details</h1>
                    <p className="text-slate-400 capitalize">{match.mode} Match</p>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <PlayerCard
                            playerId={match.player1_id}
                            username={match.player1_username}
                            avatar={match.player1_avatar}
                            score={match.player1_score}
                            xpGained={match.player1_xp_gained}
                            isWinner={match.winner_id === match.player1_id}
                        />

                        {/* VS Badge */}
                        <div className="flex items-center justify-center order-first md:order-none">
                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                                <span className="text-2xl font-bold text-white">VS</span>
                            </div>
                        </div>

                        <PlayerCard
                            playerId={match.player2_id}
                            username={match.player2_username}
                            avatar={match.player2_avatar}
                            score={match.player2_score}
                            xpGained={match.player2_xp_gained}
                            isWinner={match.winner_id === match.player2_id}
                        />
                    </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Match Information</h2>
                    <div className="space-y-3">
                        <InfoRow icon={Clock} label="Duration" value={getDuration()} />
                        <InfoRow icon={Target} label="Mode" value={match.mode} />
                        <InfoRow icon={Trophy} label="Match ID" value={`#${match.id}`} />
                    </div>

                    {match.mode === "tournament" && match.tournament_id && (
                        <Link
                            to={`/game/tournament/${match.tournament_id}`}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition" >
                            <Trophy className="w-5 h-5" />
                            View Tournament Bracket
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
