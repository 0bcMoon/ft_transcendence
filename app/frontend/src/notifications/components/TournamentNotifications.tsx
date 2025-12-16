// src/components/tournament/TournamentToasts.tsx

import { Trophy, Swords, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TournamentToastProps {
    tournament: { id: number; name: string };
    onClose: () => void;
}

export function TournamentFullToast({ tournament, onClose }: TournamentToastProps) {
    return (
        <div className="bg-gray-800 border border-green-500/50 text-white rounded-lg shadow-xl p-4 min-w-[340px] flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
                <p className="font-bold text-base">Tournament Full</p>
                <p className="text-sm text-gray-300">{tournament.name}</p>
                <p className="text-xs text-green-400 mt-1">Starting in 5 seconds</p>
            </div>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}

// export function TournamentStartedToast({ tournament, onClose }: TournamentToastProps) {
//     const handlePlayNow = () => {
//         onClose();
//         window.location.href = `/tournaments/${tournament.id}/bracket`;  // ✅ Go to bracket
//     };
//
//     return (
//         <div className="bg-gray-800 border border-blue-500/50 rounded-xl shadow-2xl p-5 min-w-[360px]">
//             <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
//                     <Play className="w-6 h-6 text-blue-400" />
//                 </div>
//                 <div className="flex-1">
//                     <p className="text-xl font-bold text-white">Tournament Started</p>
//                     <p className="text-sm text-gray-300">{tournament.name}</p>
//                 </div>
//                 <button
//                     onClick={onClose}
//                     className="text-gray-400 hover:text-white transition-colors"
//                 >
//                     <X className="w-5 h-5" />
//                 </button>
//             </div>
//
//             <button
//                 onClick={handlePlayNow}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
//             >
//                 <Play className="w-4 h-4" />
//                 <span>View Bracket</span>
//             </button>
//         </div>
//     );
// }

// ✅ UPDATED - Navigate to actual match
export function MatchReadyToast({
    tournament,
    match,
    onClose
}: TournamentToastProps & {
    match: {
        id: number;          // ✅ Add match ID
        round: number;
        matchNumber: number;
    }
}) {
    const handleJoinMatch = () => {
        onClose();
        // ✅ Navigate to the specific match page
        window.location.href = `/game/tournament/${tournament.id}/match/${match.id}`;
    };

    return (
        <div className="bg-gray-800 border border-purple-500/50 rounded-xl shadow-2xl p-5 min-w-[360px]">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Swords className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                    <p className="text-xl font-bold text-white">Your Match is Ready! </p>
                    <p className="text-sm text-gray-300">
                        {tournament.name}
                    </p>
                    <p className="text-xs text-purple-400 mt-1">
                        Round {match.round} • Match #{match.matchNumber}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <button
                onClick={handleJoinMatch}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
            >
                <Play className="w-4 h-4" />
                <span>Join Match Now</span>
            </button>
        </div>
    );
}

export function TournamentFinishedToast({
    tournament,
    champion,
    onClose
}: TournamentToastProps & {
    champion: { username: string }
}) {
    const handleViewResults = () => {
        onClose();
        window.location.href = `/tournaments/${tournament.id}/bracket`;  // ✅ Go to bracket to see results
    };

    return (
        <div className="bg-gray-800 border border-yellow-500/50 rounded-xl shadow-2xl p-5 min-w-[360px]">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                    <p className="text-xl font-bold text-white">Tournament Finished! </p>
                    <p className="text-sm text-gray-300">{tournament.name}</p>
                    <p className="text-sm text-yellow-400 mt-2">
                        🏆 Champion: <span className="font-bold">{champion.username}</span>
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <button
                onClick={handleViewResults}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-yellow-600/20 flex items-center justify-center gap-2"
            >
                <Trophy className="w-4 h-4" />
                <span>View Results</span>
            </button>
        </div>
    );
}
