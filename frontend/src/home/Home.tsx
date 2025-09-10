import { useState, useEffect } from "react";
import { Trophy, Clock, Users, Crown, Target } from "lucide-react";
import { useAuthStore } from "@/state/authStore";
import api from "@/api/api.ts";
import "@/App.css";
import LineChart from "../charts/LineChart";
import BarChart from "../charts/BarChart";
import DonutChart from "../charts/DonutChart";

interface StatCardProps {
    icon: React.ReactNode;
    iconColor: string;
    bgColor: string;
    label: string;
    value: string | number;
    subText: string;
}

interface Stats {
    ranking: number | null;
    wins: number;
    playtime: number;
    weeklyPlaytime: { day: string; value: number }[];
    matchResults: { outcome: string; count: number }[];
    opponentStats: { name: string; wins: number; losses: number }[];
}

export default function HomePage() {
    const user = useAuthStore((state) => state.user);
    const [stats, setStats] = useState<Stats>({
        ranking: null,
        wins: 0,
        playtime: 0,
        weeklyPlaytime: [],
        matchResults: [],
        opponentStats: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await api.get("/game/stats");
                // For demo purposes, let's mock some additional data that would come from the API
                const mockData = {
                    ...res.data,
                    weeklyPlaytime: [
                        { day: "Mon", value: 800 },
                        { day: "Tue", value: 1500 },
                        { day: "Wed", value: 2000 },
                        { day: "Thu", value: 1400 },
                        { day: "Fri", value: 2500 },
                        { day: "Sat", value: 2000 },
                        { day: "Sun", value: 1300 },
                        { day: "Mon", value: 1500 },
                        { day: "Tue", value: 2000 },
                        { day: "Wed", value: 1300 },
                        { day: "Thu", value: 1000 },
                        { day: "Fri", value: 2000 },
                        { day: "Sat", value: 2400 }
                    ],
                    matchResults: [
                        { outcome: "Wins", count: res.data.wins },
                        { outcome: "Losses", count: res.data.wins * 0.6 }, // Just for demo
                        { outcome: "Draws", count: res.data.wins * 0.1 }  // Just for demo
                    ],
                    opponentStats: [
                        { name: "Player 1", wins: 12, losses: 5 },
                        { name: "Player 2", wins: 8, losses: 10 },
                        { name: "Player 3", wins: 15, losses: 3 },
                        { name: "Player 4", wins: 6, losses: 7 }
                    ]
                };
                setStats(mockData);
            } catch (err) {
                console.error("Failed to load stats", err);
            } finally {
                setLoading(false);
            }
        }
        if (user) fetchStats();
    }, [user]);

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-5xl mx-auto w-full px-6 py-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-2xl p-8 text-white mb-8">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-extrabold text-center tracking-wide">
                            PING PONG STATS
                        </h1>
                    </div>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<Crown size={22} />}
                        iconColor="text-yellow-500"
                        bgColor="bg-yellow-50"
                        label="Global Ranking"
                        value={loading ? "..." : stats.ranking ? `#${stats.ranking}` : "Unranked"}
                        subText="Your position"
                    />
                    <StatCard
                        icon={<Trophy size={22} />}
                        iconColor="text-emerald-500"
                        bgColor="bg-emerald-50"
                        label="Total Wins"
                        value={loading ? "..." : stats.wins}
                        subText={`${loading ? "..." : stats.wins} victories`}
                    />
                    <StatCard
                        icon={<Clock size={22} />}
                        iconColor="text-purple-500"
                        bgColor="bg-purple-50"
                        label="Playtime"
                        value={loading ? "..." : `${stats.playtime}h`}
                        subText="Total hours played"
                    />
                </div>

                {/* Playtime Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Playtime History</h2>
                    <div className="h-80 w-full">
                        {!loading && stats.weeklyPlaytime.length > 0 && (
                            <LineChart
                                data={stats.weeklyPlaytime}
                                xKey="day"
                                yKey="value"
                                title="Total playtime (seconds)"
                                lineColor="#10b981"
                            />
                        )}
                    </div>
                </div>

                {/* Match Results and Player Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Match Results */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Match Results</h2>
                        <div className="h-64">
                            {!loading && stats.matchResults.length > 0 && (
                                <DonutChart
                                    data={stats.matchResults}
                                    labelKey="outcome"
                                    valueKey="count"
                                    colors={["#10b981", "#ef4444", "#f59e0b"]}
                                />
                            )}
                        </div>
                    </div>

                    {/* Win/Loss by Opponent */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance by Opponent</h2>
                        <div className="h-64">
                            {!loading && stats.opponentStats.length > 0 && (
                                <BarChart
                                    data={stats.opponentStats}
                                    xKey="name"
                                    yKeys={["wins", "losses"]}
                                    colors={["#10b981", "#ef4444"]}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Performance Metrics */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            icon={<Target size={22} />}
                            iconColor="text-blue-500"
                            bgColor="bg-blue-50"
                            label="Win Rate"
                            value={loading ? "..." : `${Math.round(stats.wins / (stats.wins + (stats.matchResults[1]?.count || 0)) * 100)}%`}
                            subText="Win to loss ratio"
                        />
                        <StatCard
                            icon={<Users size={22} />}
                            iconColor="text-amber-500"
                            bgColor="bg-amber-50"
                            label="Opponents Faced"
                            value={loading ? "..." : stats.opponentStats.length}
                            subText="Unique players"
                        />
                        <StatCard
                            icon={<Trophy size={22} />}
                            iconColor="text-rose-500"
                            bgColor="bg-rose-50"
                            label="Best Score"
                            value={loading ? "..." : "21-5"}
                            subText="Highest point difference"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, iconColor, bgColor, label, value, subText }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div className={`${bgColor} ${iconColor} p-3 rounded-xl`}>{icon}</div>
                <span className="text-sm font-medium text-gray-500">{label}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm text-gray-500">{subText}</p>
        </div>
    );
}
