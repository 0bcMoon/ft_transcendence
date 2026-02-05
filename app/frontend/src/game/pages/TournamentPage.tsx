import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Loader2, Plus, ArrowLeft, AlertCircle } from "lucide-react";
import { useListTournaments } from "../hooks/queries";
import { TournamentCard } from "../components/TournamentCard";
import { CreateTournamentModal } from "../components/CreateTournamentModal";

export default function TournamentPage() {
    const { data: tournaments = [], isLoading, isError, refetch } = useListTournaments();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-6 sm:py-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back Button */}
                <Link
                    to="/game"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-blue-400" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            Tournaments
                        </h1>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Create Tournament</span>
                        <span className="sm:hidden">Create</span>
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center p-20">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <AlertCircle className="w-16 h-16 text-red-500" />
                        <p className="text-xl text-slate-300">Failed to load tournaments</p>
                    </div>
                )}

                {/* Tournaments List */}
                {!isLoading && !isError && tournaments.length > 0 && (
                    <div className="space-y-4">
                        {tournaments.map((tournament) => (
                            <TournamentCard key={tournament.id} tournament={tournament} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && tournaments.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 gap-4 bg-slate-900 rounded-2xl border border-slate-800">
                        <Trophy className="w-16 h-16 text-slate-600" />
                        <div className="text-center">
                            <h2 className="text-xl text-slate-300 mb-2">No Tournaments Yet</h2>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <CreateTournamentModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        refetch();
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
