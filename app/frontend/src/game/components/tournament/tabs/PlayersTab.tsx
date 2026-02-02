import { useTournamentPlayers } from '../../../hooks/queries';
import { Loader2, Users, XCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TournamentPlayer } from '../../../types/types';

interface PlayersTabProps {
    tournamentId: number;
}

export function PlayersTab({ tournamentId }: PlayersTabProps) {
    const { data: players, isLoading, error } = useTournamentPlayers(tournamentId);
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-400 mb-4" size={40} />
                <p className="text-slate-400 font-medium">Loading players...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                    <XCircle className="text-red-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-red-400 mb-2">
                    Failed to Load Players
                </h3>
                <p className="text-slate-400 text-sm">
                    {error instanceof Error ? error. message :  'An unexpected error occurred'}
                </p>
            </div>
        );
    }

    if (!players || players.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                    <Users className="text-slate-500" size={40} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                    No Players Registered Yet
                </h2>
                <p className="text-slate-400">
                    Be the first to join this tournament! 
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                    Registered Players
                </h3>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
                {players. map((player:  TournamentPlayer) => (
                    <button
                        key={player.id}
                        onClick={() => navigate(`/users/${player.user_id}`)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-all duration-200 text-left group"
                    >
                        <div className="relative flex-shrink-0">
                            <img
                                src={player.profile_picture}
                                alt={player.username}
                                className="w-14 h-14 rounded-full border-2 border-slate-700 group-hover:border-blue-500/50 object-cover transition-colors"
                                onError={(e) => {
                                    e.currentTarget.src = '/default-avatar.png';
                                }}
                            />
                            {player.eliminated === 1 ?  (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                    <XCircle size={12} className="text-white" />
                                </div>
                            ) : (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                    <CheckCircle size={12} className="text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                                    {player.username}
                                </p>
                                {player.eliminated === 1 && (
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                                        OUT
                                    </span>
                                )}
                            </div>
                        </div>

                    </button>
                ))}
            </div>
        </div>
    );
}
