import { useState, useEffect } from "react";
import { Trophy, Clock, Users, Crown, Target, Gamepad2, Brain, TrendingUp } from "lucide-react";
import { useWebSocket } from "@/context/WebSocketContext";

interface Stats {
    totalWins: number;
    totalLosses: number;
    totalMatches: number;
    winRate: number;
    ranking: number | null;
    totalPlaytime: number; // in minutes
    
    // Game mode stats - simple counts
    oneVsOneWins: number;
    oneVsOneLosses: number;
    fourVsFourWins: number;
    fourVsFourLosses: number;
    tournamentWins: number;
    tournamentLosses: number;
    aiWins: number;
    aiLosses: number;
    
    // Recent matches - last 5
    recentMatches: {
        id: number;
        opponent: string;
        gameMode: string; // "1v1", "4v4", "tournament", "ai"
        result: "win" | "loss";
        playerScore: number;
        opponentScore: number;
        playedAt: string; // ISO date string
    }[];
}

export default function HomePage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This would be your actual API call
        // const fetchStats = async () => {
        //     try {
        //         const response = await api.get('/user/stats');
        //         setStats(response.data);
        //     } catch (error) {
        //         console.error('Failed to fetch stats:', error);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchStats();

        // Mock data for demo
        setTimeout(() => {
            setStats({
                totalWins: 45,
                totalLosses: 23,
                totalMatches: 68,
                winRate: 66,
                ranking: 8,
                totalPlaytime: 1240, // minutes
                
                oneVsOneWins: 25,
                oneVsOneLosses: 12,
                fourVsFourWins: 12,
                fourVsFourLosses: 8,
                tournamentWins: 6,
                tournamentLosses: 2,
                aiWins: 2,
                aiLosses: 1,
                
                recentMatches: [
                    {
                        id: 1,
                        opponent: "Alex Chen",
                        gameMode: "1v1",
                        result: "win",
                        playerScore: 21,
                        opponentScore: 18,
                        playedAt: "2025-09-11T10:30:00Z"
                    },
                    {
                        id: 2,
                        opponent: "Team Blue",
                        gameMode: "4v4",
                        result: "loss",
                        playerScore: 19,
                        opponentScore: 21,
                        playedAt: "2025-09-10T15:45:00Z"
                    },
                    {
                        id: 3,
                        opponent: "Sarah Kim",
                        gameMode: "1v1",
                        result: "win",
                        playerScore: 21,
                        opponentScore: 16,
                        playedAt: "2025-09-09T20:15:00Z"
                    },
                    {
                        id: 4,
                        opponent: "AI Hard",
                        gameMode: "ai",
                        result: "win",
                        playerScore: 21,
                        opponentScore: 19,
                        playedAt: "2025-09-09T18:30:00Z"
                    },
                    {
                        id: 5,
                        opponent: "Tournament Semi",
                        gameMode: "tournament",
                        result: "win",
                        playerScore: 21,
                        opponentScore: 14,
                        playedAt: "2025-09-08T14:00:00Z"
                    }
                ]
            });
            setLoading(false);
        }, 500);
    }, []);

    const formatPlaytime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    const getGameModeDisplay = (mode: string) => {
        switch (mode) {
            case "1v1": return "1 vs 1";
            case "4v4": return "4 vs 4";
            case "tournament": return "Tournament";
            case "ai": return "vs AI";
            default: return mode;
        }
    };

    const getGameModeIcon = (mode: string) => {
        switch (mode) {
            case "1v1": return <Users size={18} className="text-blue-500" />;
            case "4v4": return <Users size={18} className="text-green-500" />;
            case "tournament": return <Trophy size={18} className="text-purple-500" />;
            case "ai": return <Brain size={18} className="text-orange-500" />;
            default: return <Gamepad2 size={18} className="text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="col-span-13 flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-gray-600 font-medium">Loading your stats...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="col-span-13 flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="text-red-500 text-xl font-semibold mb-2">Unable to load stats</div>
                    <p className="text-gray-600">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar bg-gray-50">
            <div className="p-6 space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                    <div className="relative z-10 text-center">
                        <h1 className="text-4xl font-bold mb-2">Ping Pong Arena</h1>
                        <p className="text-blue-100 text-lg font-medium opacity-90">
                            Track Your Journey to Excellence
                        </p>
                    </div>
                    <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors">
                                <Crown className="text-yellow-600" size={24} />
                            </div>
                            <span className="text-gray-600 font-medium">Global Rank</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {stats.ranking ? `#${stats.ranking}` : "Unranked"}
                        </div>
                        <div className="text-sm text-gray-500">Your position</div>
                    </div>
                    
                    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                                <Trophy className="text-emerald-600" size={24} />
                            </div>
                            <span className="text-gray-600 font-medium">Total Wins</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalWins}</div>
                        <div className="text-sm text-gray-500">{stats.totalMatches} matches</div>
                    </div>
                    
                    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                                <TrendingUp className="text-blue-600" size={24} />
                            </div>
                            <span className="text-gray-600 font-medium">Win Rate</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{stats.winRate}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${stats.winRate}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                                <Clock className="text-purple-600" size={24} />
                            </div>
                            <span className="text-gray-600 font-medium">Playtime</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {formatPlaytime(stats.totalPlaytime)}
                        </div>
                        <div className="text-sm text-gray-500">Total hours</div>
                    </div>
                </div>

                {/* Game Modes Performance */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Target className="text-indigo-600" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Game Mode Performance</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <Users className="text-blue-600" size={28} />
                                <span className="text-sm font-bold text-blue-800 bg-blue-200 px-3 py-1 rounded-full">1v1</span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-2xl font-bold text-gray-900">
                                    {stats.oneVsOneWins}W - {stats.oneVsOneLosses}L
                                </div>
                                <div className="text-sm font-medium text-blue-700">
                                    {Math.round((stats.oneVsOneWins / (stats.oneVsOneWins + stats.oneVsOneLosses)) * 100)}% win rate
                                </div>
                            </div>
                        </div>
                        
                        <div className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <Users className="text-green-600" size={28} />
                                <span className="text-sm font-bold text-green-800 bg-green-200 px-3 py-1 rounded-full">4v4</span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-2xl font-bold text-gray-900">
                                    {stats.fourVsFourWins}W - {stats.fourVsFourLosses}L
                                </div>
                                <div className="text-sm font-medium text-green-700">
                                    {Math.round((stats.fourVsFourWins / (stats.fourVsFourWins + stats.fourVsFourLosses)) * 100)}% win rate
                                </div>
                            </div>
                        </div>
                        
                        <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <Trophy className="text-purple-600" size={28} />
                                <span className="text-sm font-bold text-purple-800 bg-purple-200 px-3 py-1 rounded-full">Tournament</span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-2xl font-bold text-gray-900">
                                    {stats.tournamentWins}W - {stats.tournamentLosses}L
                                </div>
                                <div className="text-sm font-medium text-purple-700">
                                    {Math.round((stats.tournamentWins / (stats.tournamentWins + stats.tournamentLosses)) * 100)}% win rate
                                </div>
                            </div>
                        </div>
                        
                        <div className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <Brain className="text-orange-600" size={28} />
                                <span className="text-sm font-bold text-orange-800 bg-orange-200 px-3 py-1 rounded-full">AI</span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-2xl font-bold text-gray-900">
                                    {stats.aiWins}W - {stats.aiLosses}L
                                </div>
                                <div className="text-sm font-medium text-orange-700">
                                    {Math.round((stats.aiWins / (stats.aiWins + stats.aiLosses)) * 100)}% win rate
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Matches */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Clock className="text-gray-600" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Recent Matches</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {stats.recentMatches.map((match) => (
                            <div key={match.id} className="group p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-4 h-4 rounded-full shadow-sm ${
                                            match.result === 'win' 
                                                ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                                : 'bg-gradient-to-r from-red-400 to-red-600'
                                        }`}></div>
                                        
                                        <div className="flex items-center gap-3">
                                            {getGameModeIcon(match.gameMode)}
                                            <div>
                                                <div className="font-semibold text-gray-900 text-lg">{match.opponent}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                                    <span>{getGameModeDisplay(match.gameMode)}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(match.playedAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className={`font-bold text-lg ${
                                            match.result === 'win' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {match.result === 'win' ? 'WIN' : 'LOSS'}
                                        </div>
                                        <div className="text-gray-600 font-medium">
                                            {match.playerScore} - {match.opponentScore}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
