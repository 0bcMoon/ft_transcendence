export interface BracketMatch {
  id: number;
  round: number;
  matchNumber: number;
  player1Username: string | null;
  player2Username: string | null;
  winnerUsername: string | null;
  gameId: number | null;
  status: "pending" | "playing" | "completed";
}

interface MatchCardProps {
    match: BracketMatch;
}

export function MatchCard({ match }: MatchCardProps) {
    const isPlayer1Winner = match.winnerUsername === match.player1Username;
    const isPlayer2Winner = match.winnerUsername === match.player2Username;

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-all">
            {/* Match Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500">
                    Match #{match.matchNumber}
                </span>
                <span
                    className={`text-xs font-semibold flex items-center gap-1 ${
                        match.status === 'completed' ? 'text-green-400' : 'text-slate-500'
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${
                            match.status === 'completed' ? 'bg-green-400' : 'bg-slate-500'
                        }`}
                    ></span>
                    {match.status === 'completed' ? 'Complete' : 'Pending'}
                </span>
            </div>

            {/* Player 1 */}
            <div
                className={`flex items-center justify-between p-3 rounded-lg mb-2 transition-all ${
                    isPlayer1Winner
                        ? 'bg-green-500/10 border-2 border-green-500'
                        : 'bg-slate-800/50 border border-slate-700'
                }`}
            >
                <span className={`font-medium truncate ${isPlayer1Winner ? 'text-white font-semibold' : 'text-slate-300'}`}>
                    {match.player1Username || 'TBD'}
                </span>
            </div>

            {/* VS Divider */}
            <div className="text-center text-xs font-semibold text-slate-600 my-2">VS</div>

            {/* Player 2 */}
            <div
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    isPlayer2Winner
                        ? 'bg-green-500/10 border-2 border-green-500'
                        : 'bg-slate-800/50 border border-slate-700'
                }`}
            >
                <span className={`font-medium truncate ${isPlayer2Winner ? 'text-white font-semibold' : 'text-slate-300'}`}>
                    {match.player2Username || 'TBD'}
                </span>
            </div>
        </div>
    );
}

