// src/pages/TournamentPage. tsx

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Trophy, Loader2, Plus, Swords, ArrowLeft } from "lucide-react";

import { useListTournaments } from "../api/queries";
import { TournamentCard } from "../components/TournamentCard";
import { CreateTournamentModal } from "../components/CreateTournamentModal";

export default function TournamentPage() {
    const { data: tournaments, isLoading, refetch } = useListTournaments();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const activeTournaments = useMemo(() => {
        if (!tournaments) return [];
        return tournaments.filter(t => t.status !== 'cancelled');
    }, [tournaments]);

    return (
        <div className="min-h-screen bg-slate-950 p-6 sm: p-8">
            <div className="max-w-5xl mx-auto">

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/game"
                            aria-label="Back to Dashboard"
                            className="flex items-center justify-center h-12 w-12 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors" >
                            <ArrowLeft size={24} />
                        </Link>

                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Trophy className="text-blue-400" size={32} />
                            Tournaments
                        </h1>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-md shadow-blue-600/20"
                    >
                        <Plus size={20} />
                        <span>Create Tournament</span>
                    </button>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Loader2 className="animate-spin text-blue-400" size={32} />
                        <p className="text-slate-400 mt-4">Loading tournaments...</p>
                    </div>
                )}

                {!isLoading && activeTournaments.length === 0 && (
                    <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-12">
                        <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                            <Swords className="text-slate-500" size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            No Active Tournaments
                        </h2>
                        <p className="text-slate-400 mt-2">
                            Create a new tournament to get started
                        </p>
                    </div>
                )}

                {!isLoading && activeTournaments.length > 0 && (
                    <div className="space-y-4">
                        {activeTournaments.map((tournament) => (
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
