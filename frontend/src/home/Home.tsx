import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, MessageCircle, Trophy, Users, Gamepad2, Clock, Calendar, Award, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const username = user?.username || 'mregrag';

    useEffect(() => {
        // Simulate loading state
        const timer = setTimeout(() => {
            setLoading(false);
        }, 600);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white mb-5 shadow-lg">
                    <h1 className="text-2xl font-bold mb-1">Welcome back, {username}!</h1>
                    <p className="text-blue-100">Ready to play some ping pong?</p>
                    <div className="mt-5 flex gap-3">
                        <Link to="/game" className="bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center">
                            <Gamepad2 size={18} className="mr-1.5" />
                            Play Now
                        </Link>
                        <Link to="/chat" className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
                            <MessageCircle size={18} className="mr-1.5" />
                            Chat
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <Link to="/game" className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="bg-green-100 p-3 rounded-full mb-3">
                            <Gamepad2 size={24} className="text-green-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">Play Now</h2>
                    </Link>

                    <Link to="/chat" className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="bg-yellow-100 p-3 rounded-full mb-3">
                            <MessageCircle size={24} className="text-yellow-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">Chat</h2>
                    </Link>
                </div>

                {/* Game Modes */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                    <h2 className="font-bold text-gray-900 mb-4">Game Modes</h2>
                    <div className="space-y-3">
                        <Link to="/game/casual" className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                                <Users size={20} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Casual Match</p>
                                <p className="text-sm text-gray-500">Play for fun</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </Link>

                        <Link to="/game/ranked" className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <Trophy size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Ranked Match</p>
                                <p className="text-sm text-gray-500">Competitive play</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </Link>

                        <Link to="/game/tournament" className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                <Award size={20} className="text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Tournament</p>
                                <p className="text-sm text-gray-500">Join championship</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
