import { useState } from "react";
import { X, Trophy, Loader2, AlertCircle } from "lucide-react";
import { useCreateTournament } from "../hooks/mutations";

interface CreateTournamentModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateTournamentModal({ onClose, onSuccess }: CreateTournamentModalProps) {
    const [name, setName] = useState("");
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [error, setError] = useState("");

    const { mutate: createTournament, isPending } = useCreateTournament();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Tournament name is required");
            return;
        }
        if (trimmedName.length < 3) {
            setError("Name must be at least 3 characters");
            return;
        }

        setError("");
        createTournament(
            { name: trimmedName, maxPlayers },
            {
                onSuccess: () => {
                    onSuccess?.();
                    onClose();
                },
                onError: (err: any) => {
                    setError(err?.response?.data?.error || err?.message || "Failed to create tournament");
                },
            }
        );
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6 pointer-events-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Create Tournament</h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="text-slate-400 hover:text-white transition disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Tournament Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter tournament name"
                                maxLength={64}
                                disabled={isPending}
                                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                autoFocus
                            />
                            <p className="text-xs text-slate-500 mt-2">{name.length}/64</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Number of Players
                            </label>
                            <select
                                value={maxPlayers}
                                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                                disabled={isPending}
                                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                <option value={4}>4 Players</option>
                                <option value={8}>8 Players</option>
                                <option value={16}>16 Players</option>
                            </select>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending || !name.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50" >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Tournament"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
