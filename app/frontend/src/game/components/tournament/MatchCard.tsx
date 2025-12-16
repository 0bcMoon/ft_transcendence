// components/tournament/MatchCard.tsx
interface MatchCardProps {
    match: any;
}

export function MatchCard({ match }: MatchCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
            {/* Match Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Match #{match.match_number}
                </span>
                {match.status === 'completed' && (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                        ✓ Complete
                    </span>
                )}
                {match.status === 'pending' && (
                    <span className="text-xs font-semibold text-gray-400">
                        Pending
                    </span>
                )}
            </div>

            {/* Player 1 */}
            <div className={`flex items-center justify-between p-3 rounded-lg mb-2 transition-all ${match.winner?.id === match.player1?.id
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600'
                : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'
                }`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.player1 && (
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                            #{match.player1.seed}
                        </span>
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {match.player1?.username || 'TBD'}
                    </span>
                </div>
                {match.winner?.id === match.player1?.id && (
                    <span className="text-green-600 dark:text-green-400 ml-2">👑</span>
                )}
            </div>

            {/* VS Divider */}
            <div className="text-center text-xs font-semibold text-gray-400 my-2">
                VS
            </div>

            {/* Player 2 */}
            <div className={`flex items-center justify-between p-3 rounded-lg transition-all ${match.winner?.id === match.player2?.id
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600'
                : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'
                }`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.player2 && (
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                            #{match.player2.seed}
                        </span>
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {match.player2?.username || 'TBD'}
                    </span>
                </div>
                {match.winner?.id === match.player2?.id && (
                    <span className="text-green-600 dark:text-green-400 ml-2">👑</span>
                )}
            </div>
        </div>
    );
}
