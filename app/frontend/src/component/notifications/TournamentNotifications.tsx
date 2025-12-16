
interface TournamentToastProps {
    tournament: { id: number; name: string };
    onClose: () => void;
}

export function TournamentFullToast({ tournament, onClose }: TournamentToastProps) {
    return (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg">
            <span className="text-2xl">🏆</span>
            <div className="flex-1">
                <p className="font-bold text-green-900 dark:text-green-100">Tournament Full!</p>
                <p className="text-sm text-green-700 dark:text-green-300">{tournament.name}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Starting in 5 seconds...</p>
            </div>
            <button
                onClick={onClose}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
            >
                ✕
            </button>
        </div>
    );
}

// export function TournamentStartedToast({ tournament, onClose }: TournamentToastProps) {
//     const handlePlayNow = () => {
//         onClose();
//         window.location.href = `/tournaments/${tournament.id}`;
//     };
//
//     return (
//         <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-lg min-w-[350px]">
//             <span className="text-2xl">🚀</span>
//             <div className="flex-1">
//                 <p className="font-bold text-blue-900 dark:text-blue-100">Tournament Started! </p>
//                 <p className="text-sm text-blue-700 dark:text-blue-300">{tournament.name}</p>
//             </div>
//             <button
//                 onClick={handlePlayNow}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
//             >
//                 Play Now
//             </button>
//             <button
//                 onClick={onClose}
//                 className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 ml-2"
//             >
//                 ✕
//             </button>
//         </div>
//     );
// }

export function MatchReadyToast({
    tournament,
    match,
    onClose
}: TournamentToastProps & { match: { round: number; matchNumber: number } }) {
    const handleViewMatch = () => {
        onClose();
        window.location.href = `/tournaments/${tournament.id}`;
    };

    return (
        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 shadow-lg min-w-[350px]">
            <span className="text-2xl">⚔️</span>
            <div className="flex-1">
                <p className="font-bold text-purple-900 dark:text-purple-100">Your Match is Ready! </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                    Round {match.round} • Match #{match.matchNumber}
                </p>
            </div>
            <button
                onClick={handleViewMatch}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
                View Match
            </button>
            <button
                onClick={onClose}
                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 ml-2"
            >
                ✕
            </button>
        </div>
    );
}

export function TournamentFinishedToast({
    tournament,
    champion,
    onClose
}: TournamentToastProps & { champion: { username: string } }) {
    return (
        <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg">
            <span className="text-2xl">🏆</span>
            <div className="flex-1">
                <p className="font-bold text-yellow-900 dark:text-yellow-100">Tournament Finished!</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{tournament.name}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Champion: <span className="font-bold">{champion.username}</span> 🎉
                </p>
            </div>
            <button
                onClick={onClose}
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
            >
                ✕
            </button>
        </div>
    );
}
