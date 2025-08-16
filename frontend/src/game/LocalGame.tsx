import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, User } from 'lucide-react';

export default function LocalGame() {
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [errors, setErrors] = useState<{ player1?: string; player2?: string }>({});
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { player1?: string; player2?: string } = {};

        const name1 = player1.trim();
        const name2 = player2.trim();

        // Required fields
        if (!name1) {
            newErrors.player1 = 'Player 1 name is required';
        }
        if (!name2) {
            newErrors.player2 = 'Player 2 name is required';
        }

        // Unique names
        if (name1 && name2 && name1 === name2) {
            newErrors.player1 = 'Names must be unique';
            newErrors.player2 = 'Names must be unique';
        }

        // If any errors, show them
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Clear previous errors and start the game
        setErrors({});
        navigate('/game/local/play', {
            state: {
                player1: name1,
                player2: name2,
                startTime: new Date().toISOString(),
            },
        });
    };

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-purple-100 p-3 rounded-full mb-3">
                            <Users size={28} className="text-purple-600" />
                        </div>
                        <h2 className="font-bold text-gray-900 text-lg text-center">
                            Enter Player Names
                        </h2>
                        <p className="text-gray-600 text-lg text-center mt-1">
                            Both players will use the same device. Player 1 uses W/S keys and
                            Player 2 uses Up/Down arrows.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Player 1 */}
                            <div>
                                <div className="flex items-center mb-2">
                                    <div className="bg-green-100 p-1.5 rounded-full mr-2">
                                        <User size={16} className="text-green-600" />
                                    </div>
                                    <label htmlFor="player1" className="font-medium text-gray-700">
                                        Player 1
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        id="player1"
                                        type="text"
                                        value={player1}
                                        onChange={(e) => {
                                            setPlayer1(e.target.value);
                                            if (errors.player1) {
                                                setErrors({ ...errors, player1: undefined });
                                            }
                                        }}
                                        placeholder="Enter username"
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.player1 ? 'border-red-500' : 'border-gray-200'
                                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                    />
                                    {errors.player1 && (
                                        <p className="text-red-500 text-xs mt-1">{errors.player1}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                                    <span className="bg-gray-200 px-1.5 rounded text-gray-700 font-mono">
                                        W
                                    </span>{' '}
                                    and{' '}
                                    <span className="bg-gray-200 px-1.5 rounded text-gray-700 font-mono">
                                        S
                                    </span>{' '}
                                    keys
                                </div>
                            </div>

                            {/* Player 2 */}
                            <div>
                                <div className="flex items-center mb-2">
                                    <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                                        <User size={16} className="text-blue-600" />
                                    </div>
                                    <label htmlFor="player2" className="font-medium text-gray-700">
                                        Player 2
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        id="player2"
                                        type="text"
                                        value={player2}
                                        onChange={(e) => {
                                            setPlayer2(e.target.value);
                                            if (errors.player2) {
                                                setErrors({ ...errors, player2: undefined });
                                            }
                                        }}
                                        placeholder="Enter username"
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.player2 ? 'border-red-500' : 'border-gray-200'
                                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                    />
                                    {errors.player2 && (
                                        <p className="text-red-500 text-xs mt-1">{errors.player2}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                                    <span className="bg-gray-200 px-1.5 rounded text-gray-700 font-mono">
                                        ↑
                                    </span>{' '}
                                    and{' '}
                                    <span className="bg-gray-200 px-1.5 rounded text-gray-700 font-mono">
                                        ↓
                                    </span>{' '}
                                    keys
                                </div>
                            </div>
                        </div>

                        {/* Game Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <h3 className="font-medium text-gray-800">Game Settings</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Score Limit:</p>
                                    <p className="font-medium">11 points</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Win By:</p>
                                    <p className="font-medium">2 points</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Game Speed:</p>
                                    <p className="font-medium">Normal</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Mode:</p>
                                    <p className="font-medium">Classic</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-10 rounded-lg font-medium transition-colors flex items-center"
                            >
                                Start Game
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
