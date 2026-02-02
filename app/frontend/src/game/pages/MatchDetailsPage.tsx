import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Trophy, Clock, Target, Loader2, XCircle } from "lucide-react";
import { useGetGameDetail } from "@/game/hooks/queries";
import {PlayerCard} from "@/game/components/PlayerCard";
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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-white" size={32} />
                    <p className="text-slate-400 text-sm sm:text-base">Loading match details...</p>
                </div>
            </div>
        );
    }

    if (isError || !match) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-white text-lg sm:text-xl font-semibold mb-4">Match not found</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm sm:text-base"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-4 sm:py-6 md:py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 mb-4 sm:mb-6 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all text-sm sm:text-base"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    Back
                </button>

                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Match Details</h1>
                    <p className="text-slate-400 capitalize text-sm sm:text-base">{match.mode} Match</p>
                </div>

                {/* Players */}
                <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center">
                        <PlayerCard
                            playerId={match.player1_id}
                            username={match.player1_username}
                            avatar={match.player1_avatar}
                            score={match.player1_score}
                            xpGained={match.player1_xp_gained}
                            isWinner={match.winner_id === match.player1_id}
                        />

                        {/* VS Badge */}
                        <div className="flex flex-col items-center justify-center order-first md:order-none py-2">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 flex items-center justify-center">
                                <span className="text-xl sm:text-2xl font-bold text-white">VS</span>
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

                {/* Match Info */}
                <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-800">
                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                        Match Information
                    </h2>
                    <div className="space-y-2 sm:space-y-3">
                        <InfoRow icon={Clock} label="Duration" value={getDuration()} />
                        <InfoRow icon={Target} label="Mode" value={match.mode} />
                        <InfoRow icon={Trophy} label="Match ID" value={`#${match.id}`} />
                    </div>

                    {match.mode === 'tournament' && match.tournament_id && (
                        <Link
                            to={`/game/tournament/${match.tournament_id}`}
                            className="flex items-center justify-center gap-2 w-full px-4 sm:px-6 py-3 sm:py-4 mt-4 sm:mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all text-sm sm:text-base"
                        >
                            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                            View Tournament Bracket
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );  
}
