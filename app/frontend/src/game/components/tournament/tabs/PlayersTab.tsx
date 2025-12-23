import { useTournamentPlayers } from '../../../hooks/queries/useTournamentQueries';
import { Loader2, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PlayersTabProps {
    tournamentId: number;
}

interface PlayerAvatarProps {
    username: string;
    profile_picture?: string | null;
}

function PlayerAvatar({ username, profile_picture }: PlayerAvatarProps) {
    const [imageError, setImageError] = useState(false);
    
    const avatarUrl = profile_picture 
        ? `${import.meta.env.VITE_API_URL}/public/${profile_picture}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=3b82f6&color=fff&size=96`;
    
    if (imageError) {
        return (
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">
                    {username.charAt(0).toUpperCase()}
                </span>
            </div>
        );
    }
    
    return (
        <img
            src={avatarUrl}
            alt={username}
            className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-slate-700 object-cover"
            onError={() => setImageError(true)}
        />
    );
}

export function PlayersTab({ tournamentId }: PlayersTabProps) {
    const { data: players, isLoading, error } = useTournamentPlayers(tournamentId);
    const navigate = useNavigate();
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="animate-spin text-blue-400" size={32} />
                <p className="text-slate-400 mt-4">Loading players...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center py-16 text-red-400">
                Failed to load player list.
            </div>
        );
    }
    
    if (!players || players.length === 0) {
        return (
            <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                    <Users className="text-slate-500" size={40} />
                </div>
                <h2 className="text-xl font-bold text-white">
                    No Players Have Registered
                </h2>
                <p className="text-slate-400 mt-2">
                    Be the first to join the tournament!
                </p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                    Registered Players ({players.length})
                </h3>
            </div>
            
            <div className="bg-slate-900 rounded-lg border border-slate-800 divide-y divide-slate-800">
                {players.map((player) => (
                    <button
                        key={player.id}
                        onClick={() => navigate(`/users/${player.user_id}`)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors text-left cursor-pointer" >
                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-blue-400 text-lg">
                                #{player.seed}
                            </span>
                        </div>
                        
                        <PlayerAvatar 
                            username={player.username} 
                            profile_picture={player.profile_picture}
                        />
                        
                        <div className="flex-1">
                            <p className="font-semibold text-white">
                                {player.username}
                            </p>
                            <p className="text-sm text-slate-400">
                                Seed {player.seed}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
