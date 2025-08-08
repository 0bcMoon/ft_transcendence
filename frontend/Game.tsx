import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Users, Zap } from 'lucide-react';

export default function Game() {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white mb-5 shadow-lg">
                    <h1 className="text-2xl font-bold mb-1">Welcome to Pong Arena</h1>
                    <p className="text-blue-100">Challenge players in real-time ping pong matches or participate in tournaments to climb the ranks.</p>
                </div>

                {/* Game Options */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                    <h2 className="font-bold text-gray-900 text-lg mb-4">Select Option</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Quick Start */}
                        <div
                            className={`border rounded-xl p-5 transition-all cursor-pointer flex flex-col 
                                ${selectedOption === 'quick'
                                    ? 'border-green-500 bg-green-50 shadow-md'
                                    : 'border-gray-200 hover:border-green-200 hover:bg-green-50/30'}`}
                            onClick={() => setSelectedOption('quick')}
                        >
                            <div className="bg-green-100 p-3 rounded-full w-fit mb-3">
                                <Zap size={24} className="text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Quick Start</h3>
                            <p className="text-gray-600 text-sm mb-4 flex-grow">Play real-time matches with friends. Climb the leaderboard and earn glory in epic battles.</p>

                            {selectedOption === 'quick' && (
                                <Link to="/game/quick" className="bg-green-600 text-white py-2 px-4 rounded-lg text-center hover:bg-green-700 transition-colors mt-2">
                                    Start Game
                                </Link>
                            )}
                        </div>

                        {/* Tournament */}
                        <div
                            className={`border rounded-xl p-5 transition-all cursor-pointer flex flex-col
                                ${selectedOption === 'tournament'
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'}`}
                            onClick={() => setSelectedOption('tournament')}
                        >
                            <div className="bg-blue-100 p-3 rounded-full w-fit mb-3">
                                <Trophy size={24} className="text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Tournament</h3>
                            <p className="text-gray-600 text-sm mb-4 flex-grow">Join or create tournaments with multiple players. Compete in bracket-style competitions and win trophies.</p>

                            {selectedOption === 'tournament' && (
                                <Link to="/game/tournament" className="bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors mt-2">
                                    Browse Tournaments
                                </Link>
                            )}
                        </div>

                        {/* Local Game */}
                        <div
                            className={`border rounded-xl p-5 transition-all cursor-pointer flex flex-col
                                ${selectedOption === 'local'
                                    ? 'border-purple-500 bg-purple-50 shadow-md'
                                    : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'}`}
                            onClick={() => setSelectedOption('local')}
                        >
                            <div className="bg-purple-100 p-3 rounded-full w-fit mb-3">
                                <Users size={24} className="text-purple-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Local Game</h3>
                            <p className="text-gray-600 text-sm mb-4 flex-grow">Join or create tournaments with multiple players. Compete in bracket-style competitions and win trophies.</p>

                            {selectedOption === 'local' && (
                                <Link to="/game/local" className="bg-purple-600 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors mt-2">
                                    Play Locally
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Game Information */}
                {selectedOption && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                        <h2 className="font-bold text-gray-900 text-lg mb-4">
                            {selectedOption === 'quick' && 'Quick Start Details'}
                            {selectedOption === 'tournament' && 'Tournament Details'}
                            {selectedOption === 'local' && 'Local Game Details'}
                        </h2>

                        {selectedOption === 'quick' && (
                            <div>
                                <p className="text-gray-600 mb-4">Jump into a match with another player instantly. Perfect for a quick game or practice.</p>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Active Players</p>
                                        <p className="font-bold text-green-600">24</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Waiting</p>
                                        <p className="font-bold text-blue-600">3</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedOption === 'tournament' && (
                            <div>
                                <p className="text-gray-600 mb-4">Compete in organized tournaments with brackets and elimination rounds.</p>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Active Tournaments</p>
                                        <p className="font-bold text-blue-600">5</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Players Competing</p>
                                        <p className="font-bold text-green-600">42</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedOption === 'local' && (
                            <div>
                                <p className="text-gray-600 mb-4">Play on the same device with a friend. Perfect for in-person challenges.</p>
                                <div className="flex gap-4 mb-4">
                                    <div className="bg-gray-50 p-3 rounded-lg flex-1">
                                        <p className="text-sm text-gray-500 mb-1">Controls</p>
                                        <p className="text-sm font-medium text-gray-700">Player 1: W/S keys</p>
                                        <p className="text-sm font-medium text-gray-700">Player 2: Up/Down arrows</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
