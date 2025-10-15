import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Clock, UserCircle2 } from "lucide-react";

interface Player {
    id: string;
    username: string;
    avatar: string;
    joinedAt: string;
    ready: boolean;
}

export default function HostLobby() {
    const navigate = useNavigate();
    const [players, setPlayers] = useState<Player[]>([]);

    const tournamentName = sessionStorage.getItem("tournamentName") || "My Tournament";
    const tournamentId = sessionStorage.getItem("tournamentId") || "ABC123";

    // Simulate players joining
    useEffect(() => {
        const fakePlayers: Player[] = [
            {
                id: "1",
                username: "Mohamed",
                avatar: "https://i.pravatar.cc/150?u=mohamed",
                joinedAt: new Date().toLocaleTimeString(),
                ready: true
            },
            {
                id: "2",
                username: "Sara",
                avatar: "https://i.pravatar.cc/150?u=sara",
                joinedAt: new Date(Date.now() + 2000).toLocaleTimeString(),
                ready: false
            },
            {
                id: "3",
                username: "Ali",
                avatar: "https://i.pravatar.cc/150?u=ali",
                joinedAt: new Date(Date.now() + 4000).toLocaleTimeString(),
                ready: false
            }
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < fakePlayers.length) {
                setPlayers(prev => [...prev, fakePlayers[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const handleStart = () => {
        navigate("/game/tournament/bracket");
    };

    return (
        <div className="col-span-13 flex flex-col items-center justify-start w-full h-full bg-linear-to-br from-blue-50 to-blue-100 px-4 py-10 text-gray-800 overflow-y-auto">
            <div className="max-w-5xl w-full bg-white rounded-xl shadow-lg p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Trophy size={32} className="text-blue-500" />
                        <div>
                            <h2 className="text-2xl font-bold text-blue-700">{tournamentName}</h2>
                            <p className="text-sm text-gray-500">ID: <span className="font-mono">{tournamentId}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={handleStart}
                        disabled={players.length < 2}
                        className={`px-6 py-2 rounded font-semibold ${players.length < 2
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                    >
                        Start Tournament
                    </button>
                </div>

                {/* Player List */}
                <h3 className="text-lg font-semibold text-blue-700 mb-3">Players</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {players.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 shadow-sm">
                            <img
                                src={p.avatar}
                                alt={p.username}
                                className="w-12 h-12 rounded-full border border-gray-300"
                            />
                            <div className="flex-1">
                                <p className="font-semibold">{p.username}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock size={12} /> {p.joinedAt}
                                </p>
                            </div>
                            <span
                                className={`px-2 py-1 text-xs rounded ${p.ready ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {p.ready ? "Ready" : "Waiting"}
                            </span>
                        </div>
                    ))}
                    {players.length === 0 && (
                        <p className="text-gray-500 italic col-span-full">Waiting for players...</p>
                    )}
                </div>

                {/* Tournament Map / Bracket Preview */}
                <h3 className="text-lg font-semibold text-blue-700 mb-3">Tournament Map</h3>
                <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500 italic">
                    {/* Placeholder for bracket graphic */}
                    Bracket preview will appear here once players are ready.
                </div>
            </div>
        </div>
    );
}

