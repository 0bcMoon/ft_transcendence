import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useCreateTournament } from "@/api/gameMutations";

export default function CreateTournament() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [maxPlayers, setMaxPlayers] = useState<number>(8);
    const [error, setError] = useState("");

    const { mutate: createTournament, isPending } = useCreateTournament();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Tournament name is required");
            return;
        }
        if (trimmedName.length < 3) {
            setError("Name must be at least 3 characters");
            return;
        }
        if (![2, 4, 8, 16].includes(maxPlayers)) {
            setError("Invalid player count");
            return;
        }

        // Create tournament
        createTournament(
            { name: trimmedName, maxPlayers },
            {
                onSuccess: () => { navigate("/game/tournament/list"); }
            }
        );
    };

    return (
        <div className="col-span-13 flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Trophy size={32} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Create Tournament
                    </h1>
                    <p className="text-sm text-gray-500">
                        Set up a new tournament and invite players
                    </p>
                </div>


                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                            {error}
                        </div>
                    )}

                    {/* Tournament Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Tournament Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            placeholder="Enter tournament name"
                            maxLength={64}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Player Count */}
                    <div>
                        <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Players
                        </label>
                        <select
                            id="maxPlayers"
                            value={maxPlayers}
                            onChange={(e) => { setMaxPlayers(Number(e.target.value)); setError(""); }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" >
                            <option value={2}>2 Players</option>
                            <option value={4}>4 Players</option>
                            <option value={8}>8 Players</option>
                            <option value={16}>16 Players</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending || !name.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600" >
                        {isPending ? "Creating..." : "Create Tournament"}
                    </button>
                </form>
            </div>
        </div>
    );
}
