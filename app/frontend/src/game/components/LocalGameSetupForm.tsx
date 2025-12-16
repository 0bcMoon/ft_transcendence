import { useState } from "react";
import { Gamepad2 } from "lucide-react";

interface Props {
    onStart: (player1: string, player2: string) => void;
}

// TextField logic is integrated here for simplicity, but can be a separate component.
interface TextFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    error?: string;
}

function TextField({ id, label, value, onChange, placeholder, maxLength, error }: TextFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-semibold text-slate-300">
                {label}
            </label>
            <input
                id={id}
                type="text"
                value={value}
                placeholder={placeholder}
                maxLength={maxLength}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full h-12 px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${error ? 'border-red-500/50' : 'border-slate-700'}`}
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
    );
}

export default function LocalGameSetupForm({ onStart }: Props) {
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    const [errors, setErrors] = useState<{ player1?: string; player2?: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const name1 = player1.trim();
        const name2 = player2.trim();
        const newErrors: { player1?: string; player2?: string } = {};

        if (!name1) newErrors.player1 = "Player 1 name is required.";
        if (!name2) newErrors.player2 = "Player 2 name is required.";

        if (name1 && name2 && name1 === name2) {
            newErrors.player1 = "Player names must be different.";
            newErrors.player2 = "Player names must be different.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Clear errors and start the game if validation passes
        setErrors({});
        onStart(name1, name2);
    };

    return (
        // The background of the container where this form is placed should be slate-900 or similar
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col items-center mb-8">
                {/* Themed icon */}
                <div className="inline-flex p-4 rounded-full bg-blue-500/20 mb-4">
                    <Gamepad2 size={32} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Local Game Setup</h2>
                <p className="text-sm text-slate-400 mt-1">Enter player names to start the match</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <TextField
                    id="player1"
                    label="Player 1"
                    value={player1}
                    onChange={setPlayer1}
                    placeholder="Enter name..."
                    maxLength={16}
                    error={errors.player1}
                />

                <TextField
                    id="player2"
                    label="Player 2"
                    value={player2}
                    onChange={setPlayer2}
                    placeholder="Enter name..."
                    maxLength={16}
                    error={errors.player2}
                />

                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-lg transition-colors shadow-md shadow-blue-600/20"
                    >
                        Start Game
                    </button>
                </div>
            </form>
        </div>
    );
}

