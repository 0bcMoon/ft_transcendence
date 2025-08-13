import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, MessageCircle, Trophy, Users, Gamepad2, Clock, Calendar, Award, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
    const { user } = useAuth();
    const username = user?.username || 'mregrag';

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white mb-5 shadow-md">
                    <h1 className="text-2xl font-bold mb-1">Welcome back, {username}!</h1>
                    <p className="text-blue-100">Ready to play some ping pong?</p>
                    <div className="mt-5 flex gap-3">
                        <Link
                            to="/game"
                            className="bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all flex items-center"
                        >
                            <Gamepad2 size={18} className="mr-2" />
                            Play Now
                        </Link>
                        <Link
                            to="/chat"
                            className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center"
                        >
                            <MessageCircle size={18} className="mr-2" />
                            Chat
                        </Link>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Trophy size={18} className="text-green-600" />
                            </div>
                            <span className="text-xs font-medium text-gray-500">Ranking</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">#42</h3>
                        <p className="text-sm text-gray-500">Global position</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Zap size={18} className="text-blue-600" />
                            </div>
                            <span className="text-xs font-medium text-gray-500">Wins</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">124</h3>
                        <p className="text-sm text-gray-500">Total victories</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Clock size={18} className="text-purple-600" />
                            </div>
                            <span className="text-xs font-medium text-gray-500">Playtime</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">24h</h3>
                        <p className="text-sm text-gray-500">Last 7 days</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <Link
                        to="/game"
                        className="bg-white rounded-xl p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
                    >
                        <div className="bg-green-100 p-3 rounded-full mb-3">
                            <Gamepad2 size={24} className="text-green-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">Play Now</h2>
                    </Link>

                    <Link
                        to="/chat"
                        className="bg-white rounded-xl p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
                    >
                        <div className="bg-yellow-100 p-3 rounded-full mb-3">
                            <MessageCircle size={24} className="text-yellow-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">Chat</h2>
                    </Link>
                </div>

                {/* Game Modes */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-5">
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

                        <Link to="/events" className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-red-100 p-2 rounded-lg mr-3">
                                <Calendar size={20} className="text-red-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Events</p>
                                <p className="text-sm text-gray-500">Special competitions</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
