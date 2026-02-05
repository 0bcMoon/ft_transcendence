import { useTournamentPlayers } from "../../../hooks/queries";
import { Loader2, Users, XCircle} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TournamentPlayer } from "../../../types/types";

interface PlayersTabProps {
    tournamentId: number;
}

export function PlayersTab({ tournamentId }: PlayersTabProps) {
    const { data: players, isLoading, error } = useTournamentPlayers(tournamentId);
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-lg font-bold text-red-400 mb-2">Failed to Load Players</h3>
                <p className="text-slate-400 text-sm">
                    {error instanceof Error ? error.message : "An unexpected error occurred"}
                </p>
            </div>
        );
    }

    if (!players?.length) {
        return (
            <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <h2 className="text-xl font-bold text-white mb-2">No Players Registered Yet</h2>
                <p className="text-slate-400">Be the first to join this tournament!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            <div className="bg-slate-900 rounded-xl border border-slate-800 divide-y divide-slate-800">
                {players.map((player: TournamentPlayer) => (
                    <button
                        key={player.id}
                        onClick={() => navigate(`/users/${player.user_id}`)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition text-left group" >
                        <div className="relative flex-shrink-0">
                            <img
                                src={player.profile_picture}
                                alt={player.username}
                                className="w-12 h-12 rounded-full border-2 border-slate-700 group-hover:border-blue-500 object-cover transition"
                            />
                        </div>

                        <div className="flex-1 min-w-0 flex items-center gap-2">
                            <p className="font-semibold text-white truncate group-hover:text-blue-400 transition">
                                {player.username}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
