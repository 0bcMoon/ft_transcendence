import { Trophy, Target, TrendingUp, Award } from 'lucide-react';
import { RemoteUser } from '@/types/types';

interface ProfileStatsProps {
    user: RemoteUser;
}

interface StatCardProps {
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    iconColor: string;
    bgColor: string;
}

function StatCard({ value, icon: Icon, label, iconColor, bgColor }: StatCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800 hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-200">
            <div className="flex items-center gap-4 mb-3">
                <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{label}</p>
        </div>
    );
}

export function ProfileStats({ user }: ProfileStatsProps) {
    const totalGames = (user.wins_count ?? 0) + (user.losses_count ?? 0);
    const winRate = totalGames > 0 ? Math.round(((user.wins_count ?? 0) / totalGames) * 100) : 0;

    const statsData = [
        {
            value: user.wins_count ?? 0,
            icon: Trophy,
            label: 'Total Wins',
            iconColor: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-500/10',
        },
        {
            value: user.losses_count ?? 0,
            icon: Target,
            label: 'Total Losses',
            iconColor: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-500/10',
        },
        {
            value: `${winRate}%`,
            icon: TrendingUp,
            label: 'Win Rate',
            iconColor: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-500/10',
        },
        {
            value: user.rank ? `#${user.rank}` : 'Unranked',
            icon: Award,
            label: 'Global Rank',
            iconColor: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-500/10',
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}
