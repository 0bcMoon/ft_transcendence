import StatCard from '../components/StatCard';
import RankProgressionLineChart from '../components/RankProgressionLineChart';
import RecentGamesList from '../components/RecentGamesList';
import HeaderProfile from '../components/HeaderProfile';
import QuickActions from '../components/QuickActions';
import { Trophy, ShieldX, Percent, Star, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/state/authStore';
import { useGetUserStats } from '@/game/api/queries';

export default function HomePage() {
    const user = useAuthStore((state) => state.user);
    const userId = user?.id;
    const { data: stats, isLoading, isError, error } = useGetUserStats(userId || 0);

    const wins = stats?.wins ?? 0;
    const losses = stats?.losses ?? 0;
    const winRate = stats?.winRate != null ? `${stats.winRate}%` : 'N/A';
    const rank = stats?.rank != null ? `#${stats.rank}` : 'Unranked';

    return (
        <main className="min-h-screen overflow-y-auto  bg-slate-950">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">

                {/* Header Profile */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <HeaderProfile />
                </div>

                {/* Quick Actions */}
                <div className="mb-6 sm:mb-8 md:mb-10">
                    <QuickActions />
                </div>

                {/* Stats Section */}
                <section className="mb-6 sm:mb-8 md:mb-10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4 md: mb-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Your Stats</h2>
                        {isLoading && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="hidden sm:inline">Loading...</span>
                            </div>
                        )}
                    </div>

                    {/* Error State */}
                    {isError && (
                        <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 sm:gap-3">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-red-400 font-medium">Failed to load stats</p>
                                <p className="text-xs text-red-400/80 mt-1 hidden sm:block">
                                    {error?.message || 'Please try again later'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        <StatCard
                            title="Total Wins"
                            value={isLoading ? '—' : String(wins)}
                            icon={<Trophy className="w-4 h-4 sm:w-5 sm:h-5" />}
                            trend={wins > 0 ? "+12%" : undefined}
                        />
                        <StatCard
                            title="Total Losses"
                            value={isLoading ? '—' : String(losses)}
                            icon={<ShieldX className="w-4 h-4 sm:w-5 sm: h-5" />}
                        />
                        <StatCard
                            title="Win Rate"
                            value={isLoading ? '—' : winRate}
                            icon={<Percent className="w-4 h-4 sm:w-5 sm:h-5" />}
                            trend={stats?.winRate && stats.winRate > 50 ? "+5%" : undefined}
                        />
                        <StatCard
                            title="Current Rank"
                            value={isLoading ? '—' : rank}
                            icon={<Star className="w-4 h-4 sm:w-5 sm:h-5" />}
                        />
                    </div>
                </section>

                {/* Rank Progression Chart */}
                <section className="mb-6 sm:mb-8 md:mb-10">
                    <h2 className="text-lg sm: text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6">
                        Rank Progression
                    </h2>
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-800 p-3 sm:p-4 md:p-6">
                        <RankProgressionLineChart />
                    </div>
                </section>

                {/* Recent Games */}
                <section>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6">
                        Recent Matches
                    </h2>
                    <RecentGamesList limit={5} />
                </section>
            </div>
        </main>
    );
}
