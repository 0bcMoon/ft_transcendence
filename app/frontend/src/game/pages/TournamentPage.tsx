import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Loader2, Plus, ArrowLeft } from "lucide-react";
import { useListTournaments } from "../hooks/queries";
import { TournamentCard } from "../components/TournamentCard";
import { CreateTournamentModal } from "../components/CreateTournamentModal";

export default function TournamentPage() {
    const { data: tournaments, isLoading, refetch } = useListTournaments();
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="min-h-screen bg-slate-950 p-6 sm:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/game"
                            className="flex items-center justify-center h-12 w-12 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg" >
                            <ArrowLeft size={24} />
                        </Link>

                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Trophy className="text-blue-400" size={32} />
                            Tournaments
                        </h1>

                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg" >
                        <Plus size={20} />
                        Create Tournament
                    </button>

                </div>

                {isLoading && (
                    <div className="flex flex-col items-center py-8 text-center">
                        <Loader2 className="animate-spin text-blue-400 mb-2" size={32} />
                        <p className="text-slate-400">Loading tournaments...</p>
                    </div>
                )}

                {!isLoading && tournaments && tournaments.length > 0 && (
                    <div className="space-y-4">
                        {tournaments.map(t => (
                            <TournamentCard key={t.id} tournament={t} />
                        ))}
                    </div>
                )}

                {!isLoading && (!tournaments || tournaments.length === 0) && (
                    <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-12">
                        <h2 className="text-xl font-bold text-white">
                            No Tournaments Found
                        </h2>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <CreateTournamentModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={refetch}
                />
            )}
        </div>
    );
}
