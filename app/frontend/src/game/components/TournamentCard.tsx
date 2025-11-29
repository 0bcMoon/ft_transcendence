import { useAuthStore } from "@/state/authStore";
import { useRegisterTournamentPlayer } from "../api/mutations";
import { Tournament } from "../api/gameApi";
import { useNavigate } from "react-router-dom";
import { Trophy, Loader2, Users } from "lucide-react";

const STATUS_COLORS = {
    registration: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    active: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    finished: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
} as const;

interface TournamentCardProps {
    tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const { mutate: registerPlayer, isPending } = useRegisterTournamentPlayer();

    const handleJoin = () => {
        if (!user) return;
        registerPlayer(
            { tournamentId: tournament.id, userId: user.id, alias: user.username },
            { onSuccess: () => navigate(`/game/tournament/${tournament.id}`) }
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full">
                <Trophy size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{tournament.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Users size={14} />
                    <span>{tournament.max_players} players</span>
                </div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[tournament.status]}`}>
                    {tournament.status}
                </span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => navigate(`/game/tournament/${tournament.id}`)}
                    className="px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    View
                </button>
                <button
                    onClick={handleJoin}
                    disabled={tournament.status !== "registration" || isPending}
                    className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isPending && <Loader2 size={14} className="animate-spin" />}
                    {isPending ? "Joining..." : "Join"}
                </button>
            </div>
        </div>
    );
}
