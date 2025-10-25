import { useQuery } from "@tanstack/react-query";
import { Trophy, Loader2, Users, Calendar, Award, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { qk, useRegisterTournamentPlayer } from "@/api/gameMutations";
import { gameApi, Tournament } from "@/api/game";
import { useAuthStore } from "@/state/authStore";

const STATUS_COLORS = {
    registration: "text-green-600 bg-green-50",
    active: "text-blue-600 bg-blue-50",
    finished: "text-gray-600 bg-gray-50",
    cancelled: "text-red-600 bg-red-50",
} as const;

function TournamentCard({ tournament, onJoin, onView, isRegistering }: {
    tournament: Tournament;
    onJoin: () => void;
    onView: () => void;
    isRegistering: boolean;
}) {
    const user = useAuthStore(s => s.user);
    const canJoin = user && tournament.status === "registration";

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Info */}
                <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Trophy size={28} className="text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            {tournament.name}
                        </h2>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                                <Users size={16} />
                                <span>{tournament.max_players} players</span>
                            </div>

                            {tournament.status === "active" && (
                                <div className="flex items-center gap-1">
                                    <Award size={16} />
                                    <span>Round {tournament.current_round}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>{new Date(tournament.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[tournament.status]}`}>
                            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 md:flex-col md:w-32">
                    <button
                        onClick={onView}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                        View
                    </button>

                    {canJoin && (
                        <button
                            onClick={onJoin}
                            disabled={isRegistering}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
                        >
                            {isRegistering ? "Joining..." : "Join"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TournamentList() {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);

    const { data: tournaments, isLoading } = useQuery({
        queryKey: qk.tournaments,
        queryFn: gameApi.listTournaments,
    });

    const { mutate: registerPlayer, isPending: isRegistering } = useRegisterTournamentPlayer();

    const handleJoin = (tournament: Tournament) => {
        if (!user) return;

        registerPlayer(
            { tournamentId: tournament.id, userId: user.id, alias: user.username },
            { onSuccess: () => navigate(`/game/tournament/${tournament.id}`) }
        );
    };

    if (isLoading) {
        return (
            <div className="col-span-13 flex items-center justify-center h-full bg-gray-50">
                <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                    <span className="text-gray-700 font-medium">Loading tournaments...</span>
                </div>
            </div>
        );
    }

    const isEmpty = !tournaments || tournaments.length === 0;

    return (
        <div className="col-span-13 flex flex-col w-full h-full bg-gray-50 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Trophy className="text-blue-600" size={32} />
                            Tournaments
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Join a tournament or view competitions
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/game/tournament/create")}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-lg shadow-md transition-colors"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Create</span>
                    </button>
                </div>

                {/* Content */}
                {isEmpty ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Trophy className="mx-auto text-gray-300 mb-4" size={48} />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            No Tournaments Yet
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Be the first to create one!
                        </p>
                        <button
                            onClick={() => navigate("/game/tournament/create")}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                            Create Tournament
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tournaments.map((tournament) => (
                            <TournamentCard
                                key={tournament.id}
                                tournament={tournament}
                                onJoin={() => handleJoin(tournament)}
                                onView={() => navigate(`/game/tournament/${tournament.id}`)}
                                isRegistering={isRegistering}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
