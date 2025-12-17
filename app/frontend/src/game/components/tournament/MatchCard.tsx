interface MatchCardProps {
    match: any;
}

export function MatchCard({ match }: MatchCardProps) {
    const isPlayer1Winner = match.winner?.id === match.player1?.id;
    const isPlayer2Winner = match.winner?.id === match.player2?.id;

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-all">
            {/* Match Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500">
                    Match #{match.match_number}
                </span>
                {match.status === 'completed' && (
                    <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        Complete
                    </span>
                )}
                {match.status === 'pending' && (
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                        Pending
                    </span>
                )}
            </div>

            {/* Player 1 */}
            <div className={`flex items-center justify-between p-3 rounded-lg mb-2 transition-all ${isPlayer1Winner
                ? 'bg-green-500/10 border-2 border-green-500'
                : 'bg-slate-800/50 border border-slate-700'
                }`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.player1 && (
                        <span className="text-xs font-bold text-slate-500 flex-shrink-0">
                            #{match.player1.seed}
                        </span>
                    )}
                    <span className={`font-medium truncate ${isPlayer1Winner ? 'text-white font-semibold' : 'text-slate-300'
                        }`}>
                        {match.player1?.username || 'TBD'}
                    </span>
                </div>
                {isPlayer1Winner && (
                    <span className="text-yellow-400 ml-2 text-lg"></span>
                )}
            </div>

            {/* VS Divider */}
            <div className="text-center text-xs font-semibold text-slate-600 my-2">
                VS
            </div>

            {/* Player 2 */}
            <div className={`flex items-center justify-between p-3 rounded-lg transition-all ${isPlayer2Winner
                ? 'bg-green-500/10 border-2 border-green-500'
                : 'bg-slate-800/50 border border-slate-700'
                }`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.player2 && (
                        <span className="text-xs font-bold text-slate-500 flex-shrink-0">
                            #{match.player2.seed}
                        </span>
                    )}
                    <span className={`font-medium truncate ${isPlayer2Winner ? 'text-white font-semibold' : 'text-slate-300'
                        }`}>
                        {match.player2?.username || 'TBD'}
                    </span>
                </div>
                {isPlayer2Winner && (
                    <span className="text-yellow-400 ml-2 text-lg"></span>
                )}
            </div>
        </div>
    );
}
