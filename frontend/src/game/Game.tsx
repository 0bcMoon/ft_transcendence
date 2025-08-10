import { Link } from 'react-router-dom';
import { Trophy, Users, Zap, Cpu } from 'lucide-react';

export default function Game() {
    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white mb-5 shadow-lg">
                    <h1 className="text-2xl font-bold mb-1">Welcome to Pong Arena</h1>
                    <p className="text-blue-100">Challenge players in real-time ping pong matches or participate in tournaments to climb the ranks.</p>
                </div>

                {/* Game Options - Vertical Layout with Centered Elements */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                    <h2 className="font-bold text-gray-900 text-lg mb-4 text-center">Select Option</h2>

                    <div className="flex flex-col gap-4">
                        {/* Quick Start */}
                        <div className="border border-gray-200 rounded-xl p-6 transition-all flex flex-col items-center text-center hover:border-green-200 hover:bg-green-50/30">
                            <div className="bg-green-100 p-3 rounded-full mb-3">
                                <Zap size={28} className="text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Quick Start</h3>
                            <p className="text-gray-600 text-sm mb-4">Play real-time matches with friends. Climb the leaderboard and earn glory in epic battles.</p>

                            <Link to="/game/quick" className="bg-green-600 text-white py-2 px-6 rounded-lg inline-block hover:bg-green-700 transition-colors">
                                Start
                            </Link>
                        </div>

                        {/* AI Game - New Option */}
                        <div className="border border-gray-200 rounded-xl p-6 transition-all flex flex-col items-center text-center hover:border-orange-200 hover:bg-orange-50/30">
                            <div className="bg-orange-100 p-3 rounded-full mb-3">
                                <Cpu size={28} className="text-orange-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">AI Challenge</h3>
                            <p className="text-gray-600 text-sm mb-4">Test your skills against artificial intelligence opponents of varying difficulties. Perfect for practice and improvement.</p>

                            <Link to="/game/ai" className="bg-orange-600 text-white py-2 px-6 rounded-lg inline-block hover:bg-orange-700 transition-colors">
                                Challenge AI
                            </Link>
                        </div>

                        {/* Tournament */}
                        <div className="border border-gray-200 rounded-xl p-6 transition-all flex flex-col items-center text-center hover:border-blue-200 hover:bg-blue-50/30">
                            <div className="bg-blue-100 p-3 rounded-full mb-3">
                                <Trophy size={28} className="text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Tournament</h3>
                            <p className="text-gray-600 text-sm mb-4">Join or create tournaments with multiple players. Compete in bracket-style competitions and win trophies.</p>

                            <Link to="/game/tournament" className="bg-blue-600 text-white py-2 px-6 rounded-lg inline-block hover:bg-blue-700 transition-colors">
                                Join
                            </Link>
                        </div>

                        {/* Local Game */}
                        <div className="border border-gray-200 rounded-xl p-6 transition-all flex flex-col items-center text-center hover:border-purple-200 hover:bg-purple-50/30">
                            <div className="bg-purple-100 p-3 rounded-full mb-3">
                                <Users size={28} className="text-purple-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Local Game</h3>
                            <p className="text-gray-600 text-sm mb-4">Play on the same device with a friend. Perfect for in-person challenges.</p>

                            <Link to="/game/local" className="bg-purple-600 text-white py-2 px-6 rounded-lg inline-block hover:bg-purple-700 transition-colors">
                                Play
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
