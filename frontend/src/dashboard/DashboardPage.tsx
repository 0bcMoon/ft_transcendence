import { Trophy, Target, Gamepad2, Award, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SimpleChart from "./Chart";

interface Match {
    id: number;
    opponent: string;
    result: "Win" | "Loss";
    score: string;
    date: string;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub: string;
    color: string;
}

function StatCard({ icon, label, value, sub, color }: StatCardProps) {
    return (
        <div className={`rounded-xl p-4 shadow-sm border border-gray-100 ${color}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/80 shadow-sm">
                    {icon}
                </div>
                <span className="text-xs font-medium">{label}</span>
            </div>
            <h3 className="text-xl font-bold mb-1">{value}</h3>
            <p className="text-sm opacity-75">{sub}</p>
        </div>
    );
}

export default function UserDashboard() {
    const stats = {
        username: "PlayerOne",
        avatar: "https://via.placeholder.com/80",
        rank: 12,
        winRate: 68,
        totalMatches: 120,
        avgScore: 7.4,
    };

    const matches: Match[] = [
        { id: 1, opponent: "GamerX", result: "Win", score: "10-7", date: "2025-08-20" },
        { id: 2, opponent: "ProPaddle", result: "Loss", score: "8-10", date: "2025-08-18" },
        { id: 3, opponent: "AI_Bot", result: "Win", score: "10-4", date: "2025-08-15" },
    ];

    const performanceData = [
        { label: "Wins", value: 82, color: "#10b981" },
        { label: "Losses", value: 38, color: "#ef4444" },
        { label: "Total Games", value: 120, color: "#3b82f6" }
    ];

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white mb-5 shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src={stats.avatar}
                                alt="avatar"
                                className="w-16 h-16 rounded-full border-2 border-white/30"
                            />
                            <div>
                                <h1 className="text-2xl font-bold mb-1">{stats.username}</h1>
                                <p className="text-blue-100">Player Profile</p>
                            </div>
                        </div>
                        <Link
                            to="/"
                            className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            Home
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    <StatCard
                        icon={<Trophy size={18} />}
                        label="Rank"
                        value={`#${stats.rank}`}
                        sub="Global"
                        color="bg-yellow-50 text-yellow-600"
                    />
                    <StatCard
                        icon={<Target size={18} />}
                        label="Win Rate"
                        value={`${stats.winRate}%`}
                        sub="Overall"
                        color="bg-green-50 text-green-600"
                    />
                    <StatCard
                        icon={<Gamepad2 size={18} />}
                        label="Matches"
                        value={stats.totalMatches}
                        sub="Total"
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        icon={<Award size={18} />}
                        label="Avg Score"
                        value={stats.avgScore}
                        sub="Per match"
                        color="bg-purple-50 text-purple-600"
                    />
                </div>

                {/* Performance Chart */}
                <div className="mb-5">
                    <SimpleChart
                        data={performanceData}
                        maxValue={120}
                        title="Performance Overview"
                    />
                </div>

                {/* Recent Matches */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">Recent Matches</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-gray-600">Opponent</th>
                                    <th className="px-4 py-3 text-left text-gray-600">Result</th>
                                    <th className="px-4 py-3 text-left text-gray-600">Score</th>
                                    <th className="px-4 py-3 text-left text-gray-600">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map(m => (
                                    <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">{m.opponent}</td>
                                        <td className={`px-4 py-3 ${m.result === "Win" ? "text-green-600" : "text-red-600"}`}>
                                            {m.result}
                                        </td>
                                        <td className="px-4 py-3">{m.score}</td>
                                        <td className="px-4 py-3 text-gray-500">{m.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

