import { useState } from "react";
import { X, Trophy, Loader2 } from "lucide-react";
import { useCreateTournament } from "../hooks/mutations";

interface CreateTournamentModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateTournamentModal({ onClose, onSuccess }: CreateTournamentModalProps) {
    const [name, setName] = useState("");
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [startTime, setStartTime] = useState<string>(
        new Date().toISOString().slice(0, 16) // default to current datetime for input
    );
    const [error, setError] = useState("");

    const { mutate: createTournament, isPending } = useCreateTournament();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return setError("Tournament name is required");
        if (trimmedName.length < 3) return setError("Name must be at least 3 characters");
        if (trimmedName.length > 64) return setError("Name must be less than 64 characters");
        if (!startTime) return setError("Start time is required");

        setError("");
        createTournament(
            { name: trimmedName, maxPlayers, startTime },
            {
                onSuccess: () => { onSuccess?.(); onClose(); },
                onError: (err: any) => setError(err.response?.data?.error || err.message || "Failed to create tournament")
            }
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-gray-900" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold">Create Tournament</h2>
                    </div>
                    <button onClick={onClose} disabled={isPending} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="text-red-400 bg-red-900/20 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Tournament Name */}
                    <div>
                        <label className="block mb-1 text-sm font-semibold">Tournament Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter tournament name"
                            maxLength={64}
                            disabled={isPending}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-1">{name.length}/64</p>
                    </div>

                    {/* Max Players */}
                    <div>
                        <label className="block mb-1 text-sm font-semibold">Number of Players</label>
                        <select
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(Number(e.target.value))}
                            disabled={isPending}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={4}>4 Players</option>
                            <option value={8}>8 Players</option>
                            <option value={16}>16 Players</option>
                        </select>
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="block mb-1 text-sm font-semibold">Start Time</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            disabled={isPending}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1 py-2.5 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !name.trim() || !startTime}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition"
                        >
                            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

