import { useTournamentBracket } from '../../../hooks/queries/useTournamentQueries';
import { Loader2, GitBranch, Trophy } from 'lucide-react';
import { MatchCard } from '../MatchCard';

interface BracketTabProps {
    tournamentId: number;
}

export function BracketTab({ tournamentId }: BracketTabProps) {
    const { data: bracket, isLoading, error } = useTournamentBracket(tournamentId);

    // --- 1. Loading State ---
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="animate-spin text-blue-400" size={32} />
                <p className="text-slate-400 mt-4">Loading bracket...</p>
            </div>
        );
    }

    // --- 2. "Bracket Not Ready" State ---
    if (error || !bracket) {
        return (
            <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                    <GitBranch className="text-slate-500" size={40} />
                </div>
                <h2 className="text-xl font-bold text-white">
                    Bracket Not Ready
                </h2>
                <p className="text-slate-400 mt-2">
                    The bracket will be generated once registration closes and the tournament starts.
                </p>
            </div>
        );
    }

    // --- 3. Main Bracket Display ---
    return (
        <div className="space-y-12">
            {/* Champion Banner */}
            {bracket.champion && (
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-8 text-center shadow-2xl shadow-yellow-500/10">
                    <div className="flex justify-center items-center gap-4">
                        <Trophy size={48} className="text-white drop-shadow-lg" />
                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest text-amber-900">Tournament Champion</p>
                            <h2 className="text-4xl font-black text-white drop-shadow-md">{bracket.champion.username}</h2>
                        </div>
                        <Trophy size={48} className="text-white drop-shadow-lg" />
                    </div>
                </div>
            )}

            {/* Bracket Rounds */}
            {bracket.rounds.map((round: any) => (
                <div key={round.round}>
                    {/* Round Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                {round.name}
                            </h3>
                            <p className="text-sm text-slate-400">
                                {round.matches.length} match{round.matches.length !== 1 ? 'es' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Matches Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {round.matches.map((match: any) => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
