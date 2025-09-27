import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, ArrowLeft } from "lucide-react";

type Tournament = {
    id: string;
    name: string;
    players: { id: string; name: string }[];
};

export default function JoinTournament() {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);

    useEffect(() => {
        // For now, read from sessionStorage — later replace with API call
        const stored = sessionStorage.getItem("tournaments");
        if (stored) {
            setTournaments(JSON.parse(stored));
        } else {
            // If you only store one tournament at a time
            const single = sessionStorage.getItem("tournament");
            if (single) setTournaments([JSON.parse(single)]);
        }
    }, []);

    const handleJoin = (id: string) => {
        // You can store the selected tournament ID for the bracket page
        sessionStorage.setItem("selectedTournamentId", id);
        navigate("/game/tournament/bracket");
    };

    return (
        <div className="col-span-13 flex flex-col items-center w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center w-full max-w-3xl mb-8">
                <Link
                    to="/game/tournament"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-lg transition-all flex items-center"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Join Tournament</h1>
            </div>

            {/* Tournament List */}
            <div className="grid gap-6 w-full max-w-3xl">
                {tournaments.length === 0 ? (
                    <div className="text-gray-500 text-center py-8 bg-white rounded-lg shadow">
                        No tournaments available
                    </div>
                ) : (
                    tournaments.map((t) => (
                        <div
                            key={t.id}
                            className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Trophy size={28} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">{t.name}</h2>
                                    <p className="text-sm text-gray-500">
                                        {t.players.length} / {t.players.length} Players
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleJoin(t.id)}
                                className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Join
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}


