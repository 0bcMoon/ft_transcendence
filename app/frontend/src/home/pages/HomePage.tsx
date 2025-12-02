import StatCard from '../components/StatCard';
import RankProgressionLineChart from '../components/RankProgressionLineChart';
import RecentGamesList from '../components/RecentGamesList';
import HeaderProfile from '../components/HeaderProfile';
import QuickActions from '../components/QuickActions';
import { Trophy, ShieldX, Percent, Star } from 'lucide-react';
import { useAuthStore } from '@/state/authStore';
import { useGetUserStats } from '../../game/api/queries';


export default function HomePage() {
    const user = useAuthStore((state) => state.user);
    const userId = user?.id;

    const { data: stats, isLoading, error } = useGetUserStats(userId);

    const wins = stats?.wins ?? 0;
    const losses = stats?.losses ?? 0;
    const winRate = stats?.winRate != null ? `${stats.winRate}%` : 'N/A';
    const rank = stats?.rank != null ? `#${stats.rank}` : 'Unranked';

    return (
        <main className="h-full overflow-y-auto no-scrollbar bg-gray-50 py-8 px-4 dark:bg-gray-900">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <HeaderProfile />
                <QuickActions />

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Stats</h2>

                    {error && (
                        <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">Failed to load stats</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Wins"
                            value={isLoading ? '—' : String(wins)}
                            icon={<Trophy />}
                            trend="+12%"
                        />
                        <StatCard
                            title="Total Losses"
                            value={isLoading ? '—' : String(losses)}
                            icon={<ShieldX />}
                        />
                        <StatCard
                            title="Win Rate"
                            value={isLoading ? '—' : winRate}
                            icon={<Percent />}
                            trend="+5%"
                        />
                        <StatCard
                            title="Current Rank"
                            value={isLoading ? '—' : rank}
                            icon={<Star />}
                        />
                    </div>
                </div>

                <div className="mb-8">
                    <RankProgressionLineChart />
                </div>

                <div className="mb-12">
                    <RecentGamesList limit={5} />
                </div>
            </div>
        </main>
    );
}
