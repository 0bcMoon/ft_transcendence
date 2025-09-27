import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/state/authStore";

export default function CreateTournament() {
    const navigate = useNavigate();
    const username = useAuthStore((state) => state.user?.username) || "You";

    const [name, setName] = useState("");
    const [playerCount, setPlayerCount] = useState(4); // default 4 players

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Only allow 4 or 8 players
        if (![4, 8].includes(playerCount)) {
            alert("Only 4 or 8 players are supported.");
            return;
        }

        // Generate players array with creator as Player 1
        const players = Array.from({ length: playerCount }, (_, i) => ({
            id: `p${i + 1}`,
            name: i === 0 ? username : `Player ${i + 1}`,
        }));

        const matches = [];
        let matchId = 1;
        let round = 1;

        // First round matches
        for (let i = 0; i < players.length; i += 2) {
            matches.push({
                id: `m${matchId++}`,
                round,
                player1: players[i] || null,
                player2: players[i + 1] || null,
                score1: null,
                score2: null,
                winner: null,
            });
        }

        // Generate empty matches for next rounds until champion
        let matchesInRound = matches.length;
        while (matchesInRound > 1) {
            round++;
            matchesInRound = matchesInRound / 2;
            for (let i = 0; i < matchesInRound; i++) {
                matches.push({
                    id: `m${matchId++}`,
                    round,
                    player1: null,
                    player2: null,
                    score1: null,
                    score2: null,
                    winner: null,
                });
            }
        }

        const bracket = {
            id: crypto.randomUUID(),
            name,
            players,
            matches,
        };

        sessionStorage.setItem("tournament", JSON.stringify(bracket));
        navigate("/game/tournament/bracket");
    };

    return (
        <div className="col-span-13 flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-6">
                {/* Header */}
                <div className="flex justify-end mb-6">
                    <Link
                        to="/game/tournament"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-lg transition-all flex items-center"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Link>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Trophy size={32} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Tournament</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tournament Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Tournament Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter tournament name"
                            required
                        />
                    </div>

                    {/* Player Count */}
                    <div>
                        <label htmlFor="playerCount" className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Players
                        </label>
                        <select
                            id="playerCount"
                            value={playerCount}
                            onChange={(e) => setPlayerCount(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                            <option value={4}>4 Players</option>
                            <option value={8}>8 Players</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Create Tournament
                    </button>
                </form>
            </div>
        </div>
    );
}


