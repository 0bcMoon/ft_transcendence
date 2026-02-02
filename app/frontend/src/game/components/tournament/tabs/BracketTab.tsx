import { useTournamentBracket, useGetChampion } from '../../../hooks/queries';
import { Loader2, GitBranch, Trophy } from 'lucide-react';
import { MatchCard } from '../MatchCard';

interface BracketTabProps {
    tournamentId: number;
}

export function BracketTab({ tournamentId }: BracketTabProps) {
    const { data: matches, isLoading, error } = useTournamentBracket(tournamentId);
    const { data: champion } = useGetChampion(tournamentId);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-400" size={32} />
            </div>
        );
    }

    if (error || !matches?.length) {
        return (
            <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-10">
                <GitBranch className="mx-auto mb-4 text-slate-500" size={40} />
                <h2 className="text-lg font-bold text-white">Bracket not ready</h2>
                <p className="text-slate-400 mt-1">Tournament has not started yet.</p>
            </div>
        );
    }

    const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);

    return (
        <div className="space-y-10">
            {/* Champion Display */}
            {champion && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-center shadow-lg">
                    <p className="text-sm font-semibold text-blue-200">Champion</p>
                    <div className="flex flex-col items-center gap-2 mt-2">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-400 shadow-inner">
                            <img
                                src={champion.profile_picture}
                                alt={champion.username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-white truncate max-w-xs">
                            {champion.username}
                        </h2>
                        <Trophy size={28} className="text-white mt-1" />
                    </div>
                </div>
            )}
            {/* Tournament Rounds */}
            {rounds.map(round => (
                <div key={round}>
                    <h3 className="mb-4 text-xl font-bold text-white">Round {round}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {matches
                            .filter(match => match.round === round)
                            .map(match => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
