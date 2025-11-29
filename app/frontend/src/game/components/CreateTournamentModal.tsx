import { useState } from "react";
import { X, Trophy, Loader2 } from "lucide-react";
import { useCreateTournament } from "../api/mutations";

interface CreateTournamentModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateTournamentModal({ onClose, onSuccess }: CreateTournamentModalProps) {
    const [name, setName] = useState("");
    const [maxPlayers, setMaxPlayers] = useState(8);
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

        createTournament(
            { name: trimmedName, maxPlayers },
            {
                onSuccess: () => {
                    onSuccess?.();
                    onClose();
                }
            }
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full">
                            <Trophy size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Tournament</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Tournament Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(""); }}
                            placeholder="Enter tournament name"
                            maxLength={64}
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="maxPlayers" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Number of Players
                        </label>
                        <select
                            id="maxPlayers"
                            value={maxPlayers}
                            onChange={(e) => { setMaxPlayers(Number(e.target.value)); setError(""); }}
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={2}>2 Players</option>
                            <option value={4}>4 Players</option>
                            <option value={8}>8 Players</option>
                            <option value={16}>16 Players</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || !name.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
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
