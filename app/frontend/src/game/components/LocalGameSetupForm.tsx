import { useState } from "react";
import { Gamepad2 } from "lucide-react";

interface Props {
    onStart: (player1: string, player2: string) => void;
}

interface TextFieldProps {
    id?: string;
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
            <label htmlFor={id} className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {label}
            </label>
            <input
                id={id}
                type="text"
                value={value}
                placeholder={placeholder}
                maxLength={maxLength}
                onChange={(e) => onChange(e.target.value)}
                className={`px-4 py-3 text-base rounded-lg border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                    ${error ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-700"}`}
            />
            {error && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>}
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

        if (!name1)
            newErrors.player1 = "Player 1 name is required";
        if (!name2)
            newErrors.player2 = "Player 2 name is required";
        if (name1 === name2) {
            newErrors.player1 = "Names must be different";
            newErrors.player2 = "Names must be different";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onStart(name1, name2);
    };

    return (
        <div className="w-full p-8">
            <div className="flex flex-col items-center mb-8">
                <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-3">
                    <Gamepad2 size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Local Game</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter player names to start</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
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

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg py-3 transition shadow-md" >
                    Start Game
                </button>
            </form>
        </div>
    );
}


