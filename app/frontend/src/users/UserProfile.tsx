import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"

import { useUserById } from "./hooks/useApi"
import { ProfileHeader } from "./components/profile/ProfileHeader"
import RecentMatchesList from "./components/profile/RecentMatchesList"
import XPLineChart from "./components/profile/XPLineChart"

export default function UserProfile() {
    const { user_id } = useParams<{ user_id: string }>()
    const navigate = useNavigate()

    const userId = Number(user_id)

    const { data: user, isLoading, isError } = useUserById(userId)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (isError || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <p className="text-xl text-slate-300">User not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-6 sm:py-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition" >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <ProfileHeader user={user} />
                
                <XPLineChart userId={userId} />

                <RecentMatchesList userId={userId} />
            </div>
        </div>
    )
}
