import type React from "react"
import type { Request, BlockedUser } from "../types/User"
import { formatTimeToReadable } from "@/component/helper"
import type { RemoteUser } from "@/types/types"
import { Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface ActionButton {
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
    primary?: boolean
    destructive?: boolean
    disabled?: boolean
    isLoading?: boolean
}

interface UserCardProps {
    user: Request | RemoteUser | BlockedUser
    actions?: ActionButton[]
    showRequestDate?: boolean
    showBlockedDate?: boolean
    showOnlineStatus?: boolean
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    actions = [],
    showRequestDate = false,
    showBlockedDate = false,
    showOnlineStatus = false,
}) => {
    const navigate = useNavigate()
    const visitProfile = () => {
        navigate(`/users/${user.id}`)
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:shadow-lg hover:border-slate-700 transition-all duration-200 group">
            <div className="flex items-start gap-4 mb-5">
                {/* Avatar */}
                <div className="relative">
                    <img
                        onClick={visitProfile}
                        src={user.profile_picture || "/placeholder.svg"}
                        alt={user.display_name}
                        className="w-16 h-16 rounded-full object-cover cursor-pointer ring-2 ring-slate-800 hover:ring-blue-600 transition-all"
                    />
                    {showOnlineStatus && (
                        <div
                            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900
                                    ${user.online_status ? "bg-green-500" : "bg-slate-600"}`}
                        />
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <h3
                        onClick={visitProfile}
                        className="hover:text-blue-400 hover:underline cursor-pointer text-lg font-semibold text-white truncate"
                    >
                        {user.display_name}
                    </h3>
                    {user.username && <p className="text-sm text-slate-400 truncate">@{user.username}</p>}

                    {showRequestDate && "created_at" in user && (
                        <p className="text-sm text-slate-400 mt-2">Request sent {formatTimeToReadable(user.created_at)}</p>
                    )}

                    {showBlockedDate && "created_at" in user && (
                        <p className="text-sm text-slate-400 mt-2">Blocked {formatTimeToReadable(user.created_at)}</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            {actions.length > 0 && (
                <div className="flex gap-3">
                    {actions.length === 1
                        ? // Single action as full-width button
                        actions.map((action, index) => {
                            const Icon = action.icon
                            return (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                    className={`flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${action.disabled
                                        ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                                        : action.primary
                                            ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 hover:shadow-md focus:ring-blue-500"
                                            : action.destructive
                                                ? "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 hover:shadow-md focus:ring-red-500"
                                                : "bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-slate-600"
                                        }`}
                                >
                                    {action.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    {action.label}
                                </button>
                            )
                        })
                        : // Multiple actions as individual buttons
                        actions
                            .slice(0, 2)
                            .map((action, index) => {
                                const Icon = action.icon
                                return (
                                    <button
                                        key={index}
                                        onClick={action.onClick}
                                        disabled={action.disabled}
                                        className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${action.disabled
                                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                                            : action.primary
                                                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 hover:shadow-md focus:ring-blue-500"
                                                : action.destructive
                                                    ? "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 hover:shadow-md focus:ring-red-500"
                                                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-slate-600"
                                            }`}
                                    >
                                        {action.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                        {action.label}
                                    </button>
                                )
                            })}
                </div>
            )}
        </div>
    )
}

export default UserCard

