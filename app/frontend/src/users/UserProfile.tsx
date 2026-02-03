import { ArrowLeft } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { useUserById } from "./hooks/useApi"
import { useAuthStore } from "@/state/authStore"
import Loader from "@/vendor/loader"
import { ProfileHeader } from "./components/profile/ProfileHeader"
import { ProfileActions } from "./components/profile/ProfileActions"
import RecentMatchesList from "./components/profile/RecentMatchesList"
import XPLineChart from "./components/profile/XPLineChart"

export default function UserProfile() {
    const { user_id } = useParams<{ user_id: string }>()
    const navigate = useNavigate()

    const userId = Number(user_id)
    const currentUser = useAuthStore((s) => s.user)
    const isOwnProfile = currentUser?.id === userId

    const { data: user, isLoading, isError } = useUserById(userId)
    console.log("UserProfile render:", { userId, isOwnProfile, user, isLoading, isError })

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader />
            </div>
        )
    }

    if (isError || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <p className="text-white text-lg font-semibold mb-2">
                        Failed to load profile
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-6 sm:py-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                {/* Profile - Pass user */}
                <ProfileHeader user={user} />
                
                {!isOwnProfile && <ProfileActions user={user} />}

                {/* XP */}
                <XPLineChart userId={userId} />

                {/* Matches */}
                <RecentMatchesList userId={userId} />
            </div>
        </div>
    )
}
