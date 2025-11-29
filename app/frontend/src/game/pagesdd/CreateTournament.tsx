import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Loader2 } from "lucide-react";
import { useCreateTournament } from "@/api/gameMutations";

function CreateTournament() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [maxPlayers, setMaxPlayers] = useState<number>(8);
    const [error, setError] = useState("");

    const { mutate: createTournament, isPending } = useCreateTournament();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

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

        createTournament(
            { name: trimmedName, maxPlayers },
            {
                onSuccess: () => { navigate("/game/tournament/list"); }
            }
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-full p-4 py-8">

            <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-6
                            dark:bg-gray-800 dark:border-gray-700">

                <div className="text-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 
                                  flex items-center justify-center
                                  dark:bg-blue-900/40">
                        <Trophy size={32} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2 dark:text-white">
                        Create Tournament
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Set up a new tournament and invite players
                    </p>
                </div>


                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3
                                      dark:bg-red-900/20 dark:border-red-700 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                            Tournament Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError(""); // Clear error on change
                            }}
                            placeholder="Enter tournament name"
                            maxLength={64}
                            className="w-full px-4 py-2 border rounded-lg transition-all
                                       bg-white text-gray-900 placeholder-gray-400 border-gray-300
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                       dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-500
                                       dark:focus:ring-blue-400 dark:focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                            Number of Players
                        </label>
                        <select
                            id="maxPlayers"
                            value={maxPlayers}
                            onChange={(e) => { setMaxPlayers(Number(e.target.value)); setError(""); }}
                            className="w-full px-4 py-2 border rounded-lg transition-all appearance-none
                                       bg-white text-gray-900 border-gray-300
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                       dark:bg-gray-700 dark:text-white dark:border-gray-600" >
                            <option value={2}>2 Players</option>
                            <option value={4}>4 Players</option>
                            <option value={8}>8 Players</option>
                            <option value={16}>16 Players</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || !name.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
                                   text-white font-medium py-3 px-4 rounded-lg transition-colors 
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                   dark:focus:ring-offset-gray-800" >
                        {isPending ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Tournament"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateTournament;
