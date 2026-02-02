import { useAuthStore } from "@/state/authStore";
import { useTournamentBasic, useUserMatch } from "../../hooks/queries";
import { useRegisterTournament } from "../../hooks/mutations";
import { useNavigate } from "react-router-dom";

interface TournamentHeaderProps {
    tournamentId: number;
}

export function TournamentHeader({ tournamentId }: TournamentHeaderProps) {
    const { data: tournament, isLoading } = useTournamentBasic(tournamentId);
    const { mutate: register, isPending: isRegistering } = useRegisterTournament();
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const { data: userMatch, isLoading: isLoadingMatch } = useUserMatch( tournamentId, !!user && tournament?.status === "active");

    if (isLoading) {
        return (
            <div className="bg-slate-900 rounded-2xl p-12 flex items-center justify-center">
                <span className="text-slate-300">Loading tournament...</span>
            </div>
        );
    }
    if (!tournament) {
        return (
            <div className="bg-slate-900 rounded-2xl p-12 text-center">
                <span className="text-slate-400">Tournament not found</span>
            </div>
        );
    }

    // Use API is_registered property
    const isRegistered = tournament.is_registered;

    return (
        <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {tournament.name}
            </h1>

            {/* User Match Info */}
            {userMatch && !isLoadingMatch && (
                <div className="mb-6 bg-indigo-900/60 border border-indigo-400/40 rounded-lg p-6">
                    <div className="font-bold text-lg text-white mb-1">You have a match ready!</div>
                    <div className="text-indigo-200">
                        Round {userMatch.round} | Match #{userMatch.match_number}
                    </div>
                    <div className="text-sm text-slate-300 mb-3">
                        {userMatch.player1?.username} vs {userMatch.player2?.username}
                    </div>
                    <button
                        onClick={() => navigate(`/game/tournament/${tournamentId}/match/${userMatch.id}`)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
                    >
                        Play Your Match
                    </button>
                </div>
            )}

            {tournament.status === "registration" && (
                <div className="flex flex-col items-center gap-4">
                    {isRegistered ? (
                        <div className="px-7 py-3 rounded-lg bg-green-100 text-green-700 font-semibold">
                            You are registered!
                        </div>
                    ) : (
                        <button
                            onClick={() => register(tournamentId)}
                            disabled={isRegistering}
                            className={`px-7 py-3 rounded-lg text-white font-semibold transition ${isRegistering ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {isRegistering ? "Registering..." : "Join Tournament"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
