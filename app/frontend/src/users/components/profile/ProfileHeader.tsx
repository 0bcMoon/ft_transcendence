import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUserById } from "../../hooks/useApi";
import { useGetUserStats } from "@/game/hooks/queries";

interface StatCardProps {
    label: string;
    value: React.ReactNode;
}

function StatCard({ label, value }: StatCardProps) {
    return (
        <div className="px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
            <p className="text-xs text-slate-400 uppercase mb-1">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    );
}

export function ProfileHeader() {
    const { user_id } = useParams<{ user_id: string }>();
    const userId = Number(user_id);

    const { data: user, isLoading: userLoading } = useUserById(userId);
    const { data: stats, isLoading: statsLoading } = useGetUserStats(userId);


    const isLoading = userLoading || statsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20 bg-slate-900 rounded-2xl border border-slate-800">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    const userStats = stats || {
        level: 0,
        total_xp: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        badge_icon: null,
        badge_name: null,
    };

    const xpInLevel = userStats.total_xp % 1000;
    const levelProgress = (xpInLevel / 1000) * 100;

    return (
        <div className="flex flex-col lg:flex-row gap-8 p-6 bg-slate-900 rounded-2xl border border-slate-800">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                    <img
                        src={user?.profile_picture || "/placeholder.svg"}
                        alt={user?.display_name || "User"}
                        className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-blue-500 shadow-2xl"
                    />
                    {userStats.badge_icon && (
                        <div
                            className="absolute -bottom-2 -right-2 w-14 h-14 bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center shadow-lg"
                            title={userStats.badge_name || 'Badge'}
                        >
                            <span className="text-2xl">{userStats.badge_icon}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {user?.display_name || "Unknown User"}
                    </h1>
                    <p className="text-slate-400">@{user?.username || "unknown"}</p>
                </div>

                {/* Level Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                        <span>Level {userStats.level}</span>
                        <span>{xpInLevel} / 1000 XP</span>
                    </div>

                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${levelProgress}%` }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <StatCard label="Level" value={userStats.level} />
                    <StatCard label="Total XP" value={userStats.total_xp} />
                    <StatCard label="Wins" value={userStats.wins} />
                    <StatCard label="Losses" value={userStats.losses} />
                    <StatCard label="Win Rate" value={`${userStats.win_rate}%`} />
                </div>
            </div>
        </div>
    );
}

