// components/CreateTournamentModal. tsx
import { useState } from "react";
import { X, Trophy, Loader2 } from "lucide-react";
import { useCreateTournament } from "../hooks/mutations/useTournamentMutations";

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

        // Validate name
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Tournament name is required");
            return;
        }
        if (trimmedName.length < 3) {
            setError("Name must be at least 3 characters");
            return;
        }
        if (trimmedName.length > 64) {
            setError("Name must be less than 64 characters");
            return;
        }

        // Create tournament
        createTournament(
            {
                name: trimmedName,
                maxPlayers
            },
            {
                onSuccess: (tournament) => {
                    console.log('Tournament created:', tournament);
                    onSuccess?.();
                    onClose();
                },
                onError: (err: any) => {
                    // Handle validation errors from backend
                    if (err.response?.data?.details) {
                        const details = err.response.data.details;
                        if (Array.isArray(details)) {
                            setError(details.map((d: any) => d.message).join(', '));
                        } else {
                            setError(details);
                        }
                    } else {
                        setError(err.response?.data?.error || err.message || "Failed to create tournament");
                    }
                }
            }
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Trophy size={20} className="text-gray-600 dark:text-gray-400" />
                        </div>
                        {/* <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Tournament</h2> */}
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
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

                    {/* Tournament Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
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
                            disabled={isPending}
                            className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white 
                                     border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {name.length}/64 characters
                        </p>
                    </div>

                    {/* Max Players */}
                    <div>
                        <label htmlFor="maxPlayers" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Number of Players
                        </label>
                        <select
                            id="maxPlayers"
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(Number(e.target.value))}
                            disabled={isPending}
                            className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white 
                                     border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value={4}>4 Players</option>
                            <option value={8}>8 Players</option>
                            <option value={16}>16 Players</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 
                                     font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                                     transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !name.trim()}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white 
                                     font-medium py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
