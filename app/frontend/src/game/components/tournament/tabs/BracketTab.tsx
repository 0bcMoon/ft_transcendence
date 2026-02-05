import { useTournamentBracket, useGetChampion } from "../../../hooks/queries";
import { Loader2, GitBranch, Trophy } from "lucide-react";
import { MatchCard } from "../MatchCard";

interface BracketTabProps {
    tournamentId: number;
}

export function BracketTab({ tournamentId }: BracketTabProps) {
    const { data: matches, isLoading, error } = useTournamentBracket(tournamentId);
    const { data: champion } = useGetChampion(tournamentId);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    if (error || !matches?.length) {
        return (
            <div className="text-center p-10">
                <GitBranch className="w-10 h-10 mx-auto mb-4 text-slate-500" />
                <h2 className="text-lg font-bold text-white">Bracket Not Ready</h2>
                <p className="text-slate-400 text-sm mt-2">Tournament has not started yet.</p>
            </div>
        );
    }

    const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);

    return (
        <div className="space-y-8">
            {champion && (
                <div className="text-center p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-400" />
                    <p className="text-xs text-yellow-400 uppercase mb-3">Champion</p>
                    <img
                        src={champion.profile_picture}
                        alt={champion.username}
                        className="w-20 h-20 mx-auto rounded-full border-4 border-yellow-400 object-cover mb-2"
                    />
                    <h2 className="text-2xl font-bold text-white">{champion.username}</h2>
                </div>
            )}

            {rounds.map((round) => (
                <div key={round}>
                    <h3 className="text-xl font-bold text-white mb-4">Round {round}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {matches
                            .filter((match) => match.round === round)
                            .map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
