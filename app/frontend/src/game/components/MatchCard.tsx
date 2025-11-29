import { BracketPlayer, BracketMatch } from "../types/types";

interface MatchCardProps {
    match: BracketMatch;
}

function PlayerDisplay({ player, score, isWinner }: {
    player: BracketPlayer | null;
    score: number | null;
    isWinner: boolean;
}) {
    const name = player?.name || "TBD";
    const isTBD = !player;

    return (
        <div className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${isWinner
            ? "bg-green-100 dark:bg-green-900/40 border-2 border-green-400 dark:border-green-500"
            : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            }`}>
            <span className={`text-base font-bold truncate ${isTBD ? "text-gray-400 dark:text-gray-500" : isWinner ? "text-green-700 dark:text-green-300" : "text-gray-900 dark:text-white"
                }`}>
                {name}
            </span>
            {score !== null && (
                <span className={`text-base font-bold ml-3 ${isWinner ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-400"
                    }`}>
                    {score}
                </span>
            )}
        </div>
    );
}

export function MatchCard({ match }: MatchCardProps) {
    const { player1, player2, score1, score2, winner } = match;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 w-64 space-y-3">
            <PlayerDisplay
                player={player1}
                score={score1}
                isWinner={winner?.id === player1?.id}
            />
            <div className="text-center text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                VS
            </div>
            <PlayerDisplay
                player={player2}
                score={score2}
                isWinner={winner?.id === player2?.id}
            />
        </div>
    );
}
