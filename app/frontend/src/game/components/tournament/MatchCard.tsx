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
    const isCompleted = match.status === "completed";

    const getPlayerClasses = (isWinner: boolean) =>
        isWinner
            ? "bg-green-500/10 border-2 border-green-500 text-white font-semibold"
            : "bg-slate-800/50 border border-slate-700 text-slate-300";

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition">

            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500">
                    Match #{match.matchNumber}
                </span>
                <div className="flex items-center gap-1">
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${ isCompleted ? "bg-green-400" : "bg-slate-500" }`}
                    />
                    <span
                        className={`text-xs font-semibold ${ isCompleted ? "text-green-400" : "text-slate-500" }`} >
                        {isCompleted ? "Complete" : "Pending"}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <div className={`p-3 rounded-lg transition ${getPlayerClasses(isPlayer1Winner)}`}>
                    <span className="font-medium truncate">
                        {match.player1Username || "TBD"}
                    </span>
                </div>

                <div className="text-center text-xs font-semibold text-slate-600">VS</div>

                <div className={`p-3 rounded-lg transition ${getPlayerClasses(isPlayer2Winner)}`}>
                    <span className="font-medium truncate">
                        {match.player2Username || "TBD"}
                    </span>
                </div>
            </div>
        </div>
    );
}
