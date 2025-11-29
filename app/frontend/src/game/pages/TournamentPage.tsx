import { Trophy, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useListTournaments } from "../api/queries";
import { TournamentCard } from "../components/TournamentCard";
import { CreateTournamentModal } from "../components/CreateTournamentModal";

export default function TournamentPage() {
    const { data: tournaments, isLoading, refetch } = useListTournaments();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">

                <div className="flex items-center justify-between mb-6">

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trophy className="text-blue-600 dark:text-blue-400" size={28} />
                        Tournaments
                    </h1>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition" >
                        <Plus size={18} />
                        Create
                    </button>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={24} />
                        <span className="text-gray-700 dark:text-gray-300 ml-3">Loading... </span>
                    </div>
                )}

                {!isLoading && (!tournaments || tournaments.length === 0) && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            No Tournaments Yet
                        </h2>
                    </div>
                )}

                {!isLoading && tournaments && tournaments.length > 0 && (
                    <div className="space-y-4">
                        {tournaments.map((tournament) => (
                            <TournamentCard key={tournament.id} tournament={tournament} />
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <CreateTournamentModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => refetch()}
                />
            )}
        </div>
    );
}
