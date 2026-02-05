import { useAuthStore } from "@/state/authStore";
import { useTournamentBasic, useUserMatch } from "../../hooks/queries";
import { useRegisterTournament } from "../../hooks/mutations";
import { useNavigate } from "react-router-dom";
import { Loader2, Trophy, Play } from "lucide-react";

interface TournamentHeaderProps {
    tournamentId: number;
}

export function TournamentHeader({ tournamentId }: TournamentHeaderProps) {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    
    const { data: tournament, isLoading } = useTournamentBasic(tournamentId);
    const { data: userMatch } = useUserMatch(tournamentId, !!user && tournament?.status === "active");
    const { mutate: register, isPending: isRegistering } = useRegisterTournament();

    if (isLoading) {
        return (
            <div className="bg-slate-900 rounded-2xl p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="bg-slate-900 rounded-2xl p-12 text-center text-slate-400">
                Tournament not found
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700 shadow-xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {tournament.name}
                </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                
                {userMatch && (
                    <button
                        onClick={() => navigate(`/game/tournament/${tournamentId}/match/${userMatch.id}`)}
                        className="group relative px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2" >
                        <Play className="w-5 h-5" />
                        Play Match
                    </button>
                )}

                {tournament.status === "registration" && (
                    tournament.is_registered ? (
                        <div className="px-8 py-3 rounded-lg bg-green-500/20 border-2 border-green-500/50 text-green-400 font-semibold flex items-center gap-2">
                            <Trophy className="w-5 h-5" />
                            Registered
                        </div>
                    ) : (
                        <button
                            onClick={() => register(tournamentId)}
                            disabled={isRegistering}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 transition-all duration-200 flex items-center gap-2" >
                            {isRegistering ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <Trophy className="w-5 h-5" />
                                    Join Tournament
                                </>
                            )}
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
