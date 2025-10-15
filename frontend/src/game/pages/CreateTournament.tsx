import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft } from "lucide-react";
import { useCreateTournament } from "@/api/gameMutations";

export default function CreateTournament() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [playerCount, setPlayerCount] = useState<number>(4);
    const [formError, setFormError] = useState<string | null>(null);

    // React Query mutation (provides mutateAsync + isPending)
    const { mutateAsync: createTournament, isPending } = useCreateTournament();

    const validate = useCallback(
        (rawName: string, count: number): string | null => {
            if (!rawName.trim()) return "Tournament name is required.";
            if (rawName.trim().length < 3) return "Name must be at least 3 characters.";
            if (![4, 8].includes(count)) return "Only 4 or 8 players are supported.";
            return null;
        },
        []
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        const trimmed = name.trim();
        const err = validate(trimmed, playerCount);
        if (err) {
            setFormError(err);
            return;
        }

        try {
            await createTournament({ name: trimmed, maxPlayers: playerCount });
            navigate("/game/tournament/list"); // adjust route if different
        } catch {
            // Errors are already surfaced via toast in mutation hook
        }
    };

    return (
        <div className="col-span-13 flex items-center justify-center w-full h-full bg-linear-to-br from-gray-50 to-blue-50 px-4 py-8">
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
                    <p className="text-sm text-gray-500">
                        Set a name and choose 4 or 8 players to begin registration.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {formError && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                            {formError}
                        </div>
                    )}

                    <div>
                        <label htmlFor="tournament-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Tournament Name
                        </label>
                        <input
                            id="tournament-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (formError) setFormError(null);
                            }}
                            placeholder="e.g. Spring Championship"
                            required
                            maxLength={60}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                        <p className="mt-1 text-xs text-gray-400">{name.trim().length}/60</p>
                    </div>

                    <div>
                        <label htmlFor="playerCount" className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Players
                        </label>
                        <select
                            id="playerCount"
                            value={playerCount}
                            onChange={(e) => {
                                setPlayerCount(Number(e.target.value));
                                if (formError) setFormError(null);
                            }}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                            <option value={4}>4 Players</option>
                            <option value={8}>8 Players</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            isPending ||
                            !name.trim() ||
                            !!validate(name, playerCount)
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Creating..." : "Create Tournament"}
                    </button>
                </form>
            </div>
        </div>
    );
}
