import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, ArrowLeft, Play } from "lucide-react";
import { useAuthStore } from "@/state/authStore";

type Player = { id: string; name: string };
type Match = {
    id: string;
    round: number;
    player1: Player | null;
    player2: Player | null;
    score1: number | null;
    score2: number | null;
    winner: Player | null;
    status?: "pending" | "in-progress" | "finished";
};
type Tournament = {
    id: string;
    name: string;
    players: Player[];
    matches: Match[];
    currentRound?: number;
    status?: "waiting" | "in-progress" | "finished";
};

export default function TournamentLobby() {
    const navigate = useNavigate();
    const username = useAuthStore((state) => state.user?.username) || "Guest";

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [userMatch, setUserMatch] = useState<Match | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("tournament");
        if (stored) {
            const t: Tournament = JSON.parse(stored);
            setTournament(t);

            // Find if user is in an in-progress match
            const match = t.matches.find(
                (m) =>
                    m.status === "in-progress" &&
                    (m.player1?.name === username || m.player2?.name === username)
            );
            if (match) setUserMatch(match);
        }
    }, [username]);

    return (
        <div className="col-span-13 flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex justify-end mb-6">
                    <Link
                        to="/"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-lg transition-all flex items-center"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Home
                    </Link>
                </div>

                {/* Title Section */}
                <div className="text-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Trophy size={32} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Tournament</h1>
                </div>

                {/* If user's match is ready */}
                {!userMatch && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg shadow-sm text-center">
                        <p className="font-semibold text-green-700 mb-2">
                            Your match is ready!
                        </p>
                        <button
                            onClick={() => navigate("/game/play")}
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            <Play size={18} /> Start Game
                        </button>
                    </div>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate("/game/tournament/create")}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Create Tournament
                    </button>

                    <button
                        onClick={() => navigate("/game/tournament/join")}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                        Join Tournament
                    </button>

                    <button
                        onClick={() => navigate("/game/tournament/bracket")}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors bg-gray-50 hover:bg-gray-100 text-gray-600"
                    >
                        View Brackets
                    </button>
                </div>
            </div>
        </div>
    );
}

