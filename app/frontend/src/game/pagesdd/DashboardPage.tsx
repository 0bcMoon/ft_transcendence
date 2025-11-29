import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    History,
    ArrowLeft,
    Trophy,
    ShieldX,
    Percent,
    Star,
    LineChart,
    PieChart
} from 'lucide-react';
import { useAuthStore } from '@/state/authStore';

// --- Helper Component: Stat Card ---
// (Re-used from HomePage for consistency)
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    colorClass: string; // e.g., "text-green-400"
}

function StatCard({ title, value, icon, colorClass }: StatCardProps) {
    return (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-gray-200/10 shadow-lg
                        dark:bg-gray-800/60 dark:border-gray-700/50">
            <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${colorClass} bg-opacity-10`}>
                    {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${colorClass}` })}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}

// --- Helper Component: Match History Item ---
// (Copied from HistoryPage.tsx)
interface MatchHistoryItemProps {
    opponentName: string;
    opponentAvatar: string;
    isWin: boolean;
    score: string;
    mode: string;
    date: string;
}

function MatchHistoryItem({ opponentName, opponentAvatar, isWin, score, mode, date }: MatchHistoryItemProps) {
    return (
        <li className="flex items-center space-x-4 p-4 rounded-lg
                       hover:bg-white/5 dark:hover:bg-gray-700/50 
                       transition-colors duration-150">
            <img
                src={opponentAvatar}
                alt={opponentName}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => (e.currentTarget.src = `https://placehold.co/64x64/71717a/a3a3a3?text=${opponentName.charAt(0)}`)}
            />
            <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-white truncate">{opponentName}</p>
                <p className="text-sm text-gray-400">{mode}</p>
            </div>
            <div className="flex-shrink-0 text-right hidden sm:block">
                <p className="text-sm text-gray-400">{date}</p>
            </div>
            <div className="flex-shrink-0 text-right w-16">
                <p className={`text-lg font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                    {isWin ? 'Win' : 'Loss'}
                </p>
                <p className="text-sm text-gray-500">{score}</p>
            </div>
        </li>
    );
}

// --- Helper Component: Chart Placeholder ---
// (Stub component for you to add a charting library later)
function ChartPlaceholder({ title, icon }: { title: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-gray-200/10 shadow-lg
                        dark:bg-gray-800/60 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                {icon}
                {title}
            </h3>
            <div className="flex items-center justify-center h-48 text-gray-500">
                [Chart Data Would Go Here]
            </div>
        </div>
    );
}

// --- Main Dashboard Page Component ---
function DashboardPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    // --- Mock Data (Replace with useQuery) ---
    const stats = {
        wins: user?.wins_count ?? 0,
        losses: user?.losses_count ?? 0,
        winRate: "N/A",
        rank: user?.rank ?? "Unranked"
    };

    // Calculate win rate
    const totalGames = stats.wins + stats.losses;
    if (totalGames > 0) {
        stats.winRate = `${Math.round((stats.wins / totalGames) * 100)}%`;
    }

    const recentMatchHistory = [
        { id: 1, opponentName: "Alice", opponentAvatar: `https://i.pravatar.cc/150?u=alice`, isWin: true, score: "5 - 2", mode: "Quick Match", date: "2025-10-27" },
        { id: 2, opponentName: "Bob", opponentAvatar: `https://i.pravatar.cc/150?u=bob`, isWin: false, score: "3 - 5", mode: "Tournament", date: "2025-10-26" },
        { id: 3, opponentName: "Charlie", opponentAvatar: `https://i.pravatar.cc/150?u=charlie`, isWin: true, score: "5 - 0", mode: "Quick Match", date: "2025-10-25" },
    ];
    // --- End Mock Data ---

    return (
        // Page Container
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-y-auto dark:bg-gray-900">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* 1. Header with Back Button */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Star size={32} className="text-blue-400" />
                        <h1 className="text-3xl font-bold text-white">
                            My Dashboard
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate(-1)} // Go back
                        className="flex items-center justify-center gap-2 
                                   px-4 py-2 rounded-lg font-semibold text-sm
                                   bg-white/10 text-gray-300 
                                   hover:bg-white/20 transition-all
                                   dark:bg-gray-800/60 dark:hover:bg-gray-700/60
                                   dark:border dark:border-gray-700/50"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                </header>

                {/* 2. Key Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard title="Wins" value={String(stats.wins)} icon={<Trophy />} colorClass="text-green-400" />
                    <StatCard title="Losses" value={String(stats.losses)} icon={<ShieldX />} colorClass="text-red-400" />
                    <StatCard title="Win Rate" value={stats.winRate} icon={<Percent />} colorClass="text-blue-400" />
                    <StatCard title="Rank" value={stats.rank} icon={<Star />} colorClass="text-yellow-400" />
                </div>

                {/* 3. Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartPlaceholder title="Win/Loss Ratio" icon={<PieChart size={20} />} />
                    <ChartPlaceholder title="Rank Progression" icon={<LineChart size={20} />} />
                </div>

                {/* 4. Recent History Card */}
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-gray-200/10 shadow-lg
                                dark:bg-gray-800/60 dark:border-gray-700/50">
                    <div className="p-5 border-b border-gray-200/10 dark:border-gray-700/50">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <History size={20} />
                            Recent Matches
                        </h3>
                    </div>
                    <div className="p-2">
                        <ul className="divide-y divide-gray-200/5 dark:divide-gray-700/50">
                            {recentMatchHistory.map(match => (
                                <MatchHistoryItem
                                    key={match.id}
                                    opponentName={match.opponentName}
                                    opponentAvatar={match.opponentAvatar}
                                    isWin={match.isWin}
                                    score={match.score}
                                    mode={match.mode}
                                    date={match.date}
                                />
                            ))}
                            {recentMatchHistory.length === 0 && (
                                <p className="text-center text-gray-500 p-12">
                                    No matches played yet.
                                </p>
                            )}
                        </ul>
                    </div>
                    <div className="p-4 text-center border-t border-gray-200/10 dark:border-gray-700/50">
                        <Link
                            to="/history"
                            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            View all match history
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;

