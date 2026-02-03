import { Loader2, AlertCircle, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { useGetUserStats } from "@/game/hooks/queries";
import { RemoteUser } from "@/types/types";
import { ProfileActions } from "./ProfileActions";
import { useAuthStore } from "@/state/authStore";

interface ProfileHeaderProps {
    user: RemoteUser;
}

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

export function ProfileHeader({ user}: ProfileHeaderProps) {
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const { data: stats, isLoading, isError } = useGetUserStats(user.id);
     const currentUser = useAuthStore((s) => s.user)
    const isOwnProfile = currentUser?.id === user.id;


    useEffect(() => {
        setShowActionsMenu(false);
    }, [user.id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20 bg-slate-900 rounded-2xl border border-slate-800">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (isError || !stats) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-slate-900 rounded-2xl border border-slate-800 gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <p className="text-xl text-slate-300">Failed to load stats</p>
            </div>
        );
    }

    const xpInLevel = stats.total_xp % 1000;
    const levelProgress = (xpInLevel / 1000) * 100;

    return (
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 relative">
            {/* Actions Menu Button (only for other users) */}
            {!isOwnProfile && (
                <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    className="absolute top-6 right-6 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
            )}

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                    <img
                        src={user.profile_picture || "/placeholder.svg"}
                        alt={user.display_name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                    />
                    {user.online_status && (
                        <div
                            className="absolute bottom-0 right-8 w-5 h-5 bg-green-500 rounded-full border-4 border-slate-900"
                            style={{ transform: "translateY(50%)" }}
                        />
                    )}
                </div>

                {/* User info and stats */}
                <div className="flex-1 w-full space-y-4">
                    {/* Name */}
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            {user.display_name}
                        </h1>
                        {user.username && <p className="text-slate-400">@{user.username}</p>}
                    </div>

                    {/* Level progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-400">
                            <span>Level {stats.level}</span>
                            <span>{xpInLevel} / 1000 XP</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${levelProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <StatCard label="Level" value={stats.level} />
                        <StatCard label="Total XP" value={stats.total_xp.toLocaleString()} />
                        <StatCard label="Wins" value={stats.wins} />
                        <StatCard label="Losses" value={stats.losses} />
                        <StatCard label="Win Rate" value={`${stats.win_rate}%`} />
                    </div>
                </div>
            </div>

            {/* Actions Menu Dropdown */}
            {!isOwnProfile && showActionsMenu && (
                <ProfileActions
                    user={user}
                    onClose={() => setShowActionsMenu(false)}
                />
            )}
        </div>
    );
}
