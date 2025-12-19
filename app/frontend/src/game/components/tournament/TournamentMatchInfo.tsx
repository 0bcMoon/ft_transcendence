import { Trophy, Clock, Loader2, AlertTriangle } from "lucide-react";
import { useGetTournament } from "@/game/api/queries";

type Props = {
    tournamentId: number;
    matchId: number;
    round?: number;
    matchNumber?: number;
};

export default function TournamentMatchInfo({ tournamentId, round, matchNumber }: Props) {
    const { data: tournament, isLoading, error } = useGetTournament(tournamentId);

    if (isLoading) {
        return (
            <div className="bg-slate-900/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-800 p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl p-4 flex items-center gap-2">
                <AlertTriangle size={18} />
                Failed to load tournament
            </div>
        );
    }

    if (!tournament)
        return null;

    return (
        <div className="bg-slate-900/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-800 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>

                    <div>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                            {tournament.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">

                            {round && (
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    Round {round} • Match {matchNumber}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

