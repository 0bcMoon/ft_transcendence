import { ArrowLeft, X, Trophy, TrendingUp } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useUserById } from "./hooks/useApi"
import Loader from "@/vendor/loader"
import StatCard from "./components/profile/StatCard"
import { ProfileHeader } from "./components/profile/ProfileHeader"
import { ProfileActions } from "./components/profile/ProfileActions"
import RecentMatchesList from "./components/profile/RecentMatchesList"
import EloLineChart from "./components/profile/EloLineChart"
import { useGetUserStats } from "@/game/api/queries"
import { useAuthStore } from "@/state/authStore"
import { getRankDetails } from "./getRankDetails"

const primaryButtonClasses =
    "inline-flex items-center justify-center gap-2.5 font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md"

function UserProfile() {
    const { user_id: s_user_id } = useParams<{ user_id: string }>()
    const navigate = useNavigate()
    const user_id = s_user_id ? Number.parseInt(s_user_id, 10) : undefined

    const currentUser = useAuthStore((s) => s.user)
    const isOwnProfile = !!currentUser && user_id === currentUser.id

    const { data, isLoading: isLoadingProfile, isError: isErrorProfile } = useUserById(user_id)

    const { data: stats, isLoading: isLoadingStats, isError: isErrorStats } = useGetUserStats(user_id || 0)
    const rankDetails = getRankDetails(stats?.rank || "")

    const handleGoBack = () => navigate(-1)

    const isLoading = isLoadingProfile || isLoadingStats
    const isError = isErrorProfile || isErrorStats

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader />
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <X className="w-10 h-10 text-red-400" />
                    </div>
                    <p className="text-xl font-semibold text-white mb-2">Error Loading Profile</p>
                    <p className="text-slate-400 mb-6">Could not load user profile data.</p>
                    <button
                        onClick={handleGoBack}
                        className={`${primaryButtonClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`} >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Go Back</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={handleGoBack}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all font-medium border border-transparent hover:border-slate-800" >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {/* Profile Card */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-8 mb-6">
                    <ProfileHeader user={data} />
                    {!isOwnProfile && <ProfileActions user={data} />}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6">
                    <StatCard
                        label="Wins"
                        value={stats?.wins ?? 0}
                        icon={<Trophy className="w-5 h-5" />}
                        iconBgColor="bg-green-500/20"
                        iconColor="text-green-400"
                    />
                    <StatCard
                        label="Losses"
                        value={stats?.losses ?? 0}
                        icon={<X className="w-5 h-5" />}
                        iconBgColor="bg-red-500/20"
                        iconColor="text-red-400"
                    />
                    <StatCard
                        label="Win Rate"
                        value={`${stats?.winRate ?? 0}%`}
                        icon={<TrendingUp className="w-5 h-5" />}
                        iconBgColor="bg-blue-500/20"
                        iconColor="text-blue-400"
                    />
                    <StatCard
                        label="Leaderboard"
                        value={stats?.leaderboardPosition ? `#${stats.leaderboardPosition}` : "N/A"}
                        icon={rankDetails.icon}
                        iconBgColor=""
                        iconColor={rankDetails.colorClass}
                    />
                </div>
                <EloLineChart userId={user_id!} />
                {user_id ? <RecentMatchesList userId={user_id} limit={5} /> : null}
            </div>
        </div>
    )
}

export default UserProfile

