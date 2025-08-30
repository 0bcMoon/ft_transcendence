import { useState, useEffect } from "react";
import { Copy, Play, DoorOpen } from "lucide-react";

type Player = {
    id: string;
    name: string;
    handle: string;
    ready: boolean;
};

type Team = {
    id: string;
    name: string;
    players: Player[];
};

const MAX_PLAYERS_PER_TEAM = 4;
const TEAM_COUNT = 8; // You can increase this to 10, 12, etc.

export default function TournamentLobby() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [lobbyCode] = useState("PNGA-42");

    // Demo: simulate teams filling up
    useEffect(() => {
        const demoNames = [
            "Mohamed", "Sara", "Youssef", "Amina", "Rachid", "Nadia", "Khalid", "Ikram",
            "Omar", "Fatima", "Hassan", "Layla", "Samir", "Salma", "Adil", "Zineb",
            "Karim", "Imane", "Tariq", "Nour"
        ];

        const newTeams: Team[] = Array.from({ length: TEAM_COUNT }).map((_, i) => ({
            id: `team-${i + 1}`,
            name: `Team ${String.fromCharCode(65 + i)}`,
            players: []
        }));

        let playerIndex = 0;
        const fillTimer = setInterval(() => {
            setTeams(prev => {
                const copy = [...prev];
                for (const team of copy) {
                    if (team.players.length < MAX_PLAYERS_PER_TEAM && playerIndex < demoNames.length) {
                        team.players.push({
                            id: crypto.randomUUID(),
                            name: demoNames[playerIndex],
                            handle: `@${demoNames[playerIndex].toLowerCase()}`,
                            ready: Math.random() > 0.5
                        });
                        playerIndex++;
                        break;
                    }
                }
                return copy;
            });
            if (playerIndex >= demoNames.length) clearInterval(fillTimer);
        }, 800);

        setTeams(newTeams);
        return () => clearInterval(fillTimer);
    }, []);

    const allTeamsReady = teams.every(team =>
        team.players.length === MAX_PLAYERS_PER_TEAM &&
        team.players.every(p => p.ready)
    );

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(lobbyCode);
        } catch { }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-8 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">🏓 Tournament Lobby</h1>
                            <p className="text-blue-100 mt-1">Teams are forming. Match starts when all players are ready.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="bg-white/20 px-3 py-1 rounded font-mono text-sm">Code: {lobbyCode}</span>
                            <button
                                onClick={copyCode}
                                className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition"
                                title="Copy code"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {teams.map((team, i) => (
                        <div key={team.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">{team.name}</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {Array.from({ length: MAX_PLAYERS_PER_TEAM }).map((_, j) => {
                                    const p = team.players[j];
                                    return p ? (
                                        <div key={p.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                            <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                                                {p.name[0]}
                                            </div>
                                            <div className="mt-1 font-medium text-gray-800">{p.name}</div>
                                            <div className="text-xs text-gray-500">{p.handle}</div>
                                            <div className={`mt-1 text-xs px-2 py-1 rounded-full inline-block
                        ${p.ready ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                {p.ready ? "Ready" : "Waiting"}
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={`empty-${j}`} className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center text-gray-500">
                                            Waiting…
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                        Leave Lobby
                    </button>
                    <button
                        disabled={!allTeamsReady}
                        className={`px-4 py-2 rounded text-white font-medium transition
              ${allTeamsReady ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"}`}
                    >
                        Start Match
                    </button>
                </div>
            </div>
        </div>
    );
}

