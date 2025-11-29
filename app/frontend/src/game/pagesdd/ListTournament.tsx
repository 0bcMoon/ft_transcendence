import { Trophy, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useListTournaments } from "@/api/queries";
import { TournamentCard } from "../components/TournamentCard";

function TournamentList() {
    const navigate = useNavigate();

    const { data: tournaments, isLoading } = useListTournaments();
    console.log("Tournaments data:", tournaments);

    const isEmpty = !tournaments || tournaments.length === 0;

    return (
        <div className="flex flex-col w-full h-full bg-gray-50 p-6 overflow-y-auto dark:bg-gray-900">
            <div className="max-w-4xl mx-auto w-full">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 dark:text-white">
                            <Trophy className="text-blue-600 dark:text-blue-400" size={32} />
                            Tournaments
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate("/game/tournament/create")}
                        className="flex-shrink-0 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-lg shadow-md transition-colors dark:focus:ring-offset-gray-900" >
                        <Plus size={20} />
                        <span className="sm:inline">Create Tournament</span>
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={24} />
                        <span className="text-gray-700 font-medium ml-3 dark:text-gray-300">Loading tournaments...</span>
                    </div>

                ) : isEmpty ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center dark:bg-gray-800 dark:border dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2 dark:text-white">
                            No Tournaments Yet
                        </h2>
                    </div>

                ) : (
                    <div className="space-y-4">
                        {tournaments.map((tournament) => (
                            <TournamentCard
                                key={tournament.id}
                                tournament={tournament}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TournamentList;


