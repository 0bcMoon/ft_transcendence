import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Trophy,
    Clock,
    Users,
    Award,
    Crown,
    Users2,
    Bot

} from "lucide-react";
import { useAuthStore } from "@/state/authStore";
import api from "@/api/api.ts";
import "@/App.css";

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
}

interface GameModeCardProps {
    to: string;
    icon: React.ReactNode;
    iconColor: string;
    bgColor: string;
    title: string;
    description: string;
}
export default function HomePage() {
    const user = useAuthStore((state) => state.user);
    const [stats, setStats] = useState<Stats>({ ranking: null, wins: 0, playtime: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await api.get("/game/stats");
                setStats(res.data);
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
                            PING PONG
                        </h1>
                    </div>
                </div>

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
                        subText="Last 7 days"
                    />
                </div>

                {/* Game Modes */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Game Modes</h2>
                    <div className="space-y-3">
                        <GameModeCard
                            to="/game/local"
                            icon={<Users2 size={20} />}
                            iconColor="text-purple-500"
                            bgColor="bg-orange-50"
                            title="Local Game"
                            description="Play with a friend"
                        />
                        <GameModeCard
                            to="/game/quick"
                            icon={<Users size={20} />}
                            iconColor="text-emerald-500"
                            bgColor="bg-emerald-50"
                            title="Casual Match"
                            description="Practice and have fun"
                        />
                        <GameModeCard
                            to="/game/tournament"
                            icon={<Award size={20} />}
                            iconColor="text-purple-500"
                            bgColor="bg-purple-50"
                            title="Tournament"
                            description="Join championships"
                        />
                        <GameModeCard
                            to="/game/ai"
                            icon={<Bot size={20} />}
                            iconColor="text-purple-500"
                            bgColor="bg-cyan-50"
                            title="Play vs AI"
                            description="Challenge our AI opponent"
                        />
                        <GameModeCard
                            to="/game/multiplayer-4"
                            icon={<Users size={20} />}
                            iconColor="text-red-500"
                            bgColor="bg-red-50"
                            title="4-Player Remote"
                            description="Play Pong with 4 players"
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


function GameModeCard({ to, icon, iconColor, bgColor, title, description }: GameModeCardProps) {
    return (
        <Link
            to={to}
            className="flex items-center p-4 hover:bg-gray-50 rounded-xl transition-all group" >
            <div className={`${bgColor} ${iconColor} p-3 rounded-xl mr-4 group-hover:scale-105 transition-transform`}>
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all">
                →
            </div>
        </Link>
    );
}
