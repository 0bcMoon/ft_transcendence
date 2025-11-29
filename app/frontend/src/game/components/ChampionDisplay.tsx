import { Trophy } from "lucide-react";
import { BracketPlayer } from "@/api/tournamentUtils";

interface ChampionDisplayProps {
    winner: BracketPlayer | null | undefined;
}

export function ChampionDisplay({ winner }: ChampionDisplayProps) {
    return (
        <div className="flex flex-col items-center flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Champion</h2>
            <div className="flex items-center justify-center h-full">
                {winner ? (
                    <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-xl p-4 w-56 sm:w-64 text-center dark:bg-yellow-900/40 dark:border-yellow-700">
                        <div className="flex flex-col items-center gap-2 font-bold text-yellow-700 text-lg dark:text-yellow-300">
                            <Trophy className="text-yellow-500 dark:text-yellow-400" size={24} />
                            {winner.name}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg shadow-md p-4 h-24 w-56 sm:w-64 flex items-center justify-center text-gray-500 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600">
                        TBD
                    </div>
                )}
            </div>
        </div>
    );
}

