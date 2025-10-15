import { useQuery } from "@tanstack/react-query";
import { Trophy, Loader2, Users } from "lucide-react";
import { qk } from "@/api/gameMutations";            // Ensure this exports qk.tournaments
import { gameApi, Tournament } from "@/api/game";
import { useRegisterTournamentPlayer } from "@/api/gameMutations"; // Remove if you don't want join
import { useAuthStore } from "@/state/authStore";             // Remove if you don't want join
import { useNavigate } from "react-router-dom";

export default function TournamentList() {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);

    const { data: tournaments, isLoading, error } = useQuery({
        queryKey: qk.tournaments,
        queryFn: () => gameApi.listTournaments(),
        staleTime: 15_000,
    });

    const registerMutation = useRegisterTournamentPlayer();

    const handleJoin = (t: Tournament) => {
        if (!user) return;
        if (t.status !== "registration")
            return;
        registerMutation.mutate({
            tournamentId: t.id, userId: user.id, alias: user.username || `User${user.id}`,
        });
    };

    const handleView = (t: Tournament) => {
        navigate(`/game/tournament/${t.id}`); // Create this route later
    };

    const hasError = !!error;
    const empty = !isLoading && !hasError && (!tournaments || tournaments.length === 0);

    return (
        <div className="col-span-13 flex flex-col items-center w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trophy className="text-blue-600" /> Tournaments
            </h1>

            <div className="w-full max-w-3xl space-y-4">
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 bg-white rounded-lg shadow p-6 text-gray-600">
                        <Loader2 className="animate-spin" size={18} />
                        Loading tournaments...
                    </div>
                )}

                {empty && (
                    <div className="text-gray-500 text-center py-8 bg-white rounded-lg shadow">
                        No tournaments found.
                    </div>
                )}

                {!isLoading && !hasError && tournaments && tournaments.length > 0 && (
                    <ul className="grid gap-4">
                        {tournaments.map(t => {
                            const canJoin =
                                user && t.status === "registration" && !registerMutation.isPending;

                            return (
                                <li
                                    key={t.id}
                                    className="bg-white rounded-lg shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-200 gap-4" >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <Trophy size={28} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800">{t.name}</h2>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Users size={16} />
                                                {t.max_players} players
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Status: <span className="font-medium">{t.status}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleView(t)}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors" >
                                            View
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!canJoin}
                                            onClick={() => handleJoin(t)}
                                            className="bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:cursor-not-allowed" >
                                            {registerMutation.isPending ? "Joining..." : "Join"}
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
