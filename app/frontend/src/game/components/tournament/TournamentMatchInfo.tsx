// src/game/components/TournamentMatchInfo.tsx

import { useEffect, useState } from 'react';
import { tournamentApi } from '../../api/gameApi';
import { Trophy, Users, Clock, Loader2 } from 'lucide-react';

type Props = {
    tournamentId: number;
    matchId: number;
    round?: number;
    matchNumber?: number;
};

export default function TournamentMatchInfo({ tournamentId, round, matchNumber }: Props) {
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const data = await tournamentApi.getTournament(tournamentId);
                setTournament(data);
            } catch (error) {
                console.error('Failed to fetch tournament:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [tournamentId]);

    if (loading) {
        return (
            <div className="bg-slate-900/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-800 p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!tournament) return null;

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
                            <span className="flex items-center gap-1.5">
                                <Users size={14} />
                                {tournament.player_count}/{tournament.max_players} Players
                            </span>
                            {round && (
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    Round {round} • Match {matchNumber}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${tournament.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-slate-800 text-slate-400'
                        }`}>
                        {tournament.status === 'active' ? '🟢 Live' : tournament.status}
                    </span>
                </div>
            </div>
        </div>
    );
}
