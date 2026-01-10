import type { RemoteUser } from "@/types/types"

interface ProfileHeaderProps {
    user: RemoteUser
}

export function ProfileHeader({ user }: ProfileHeaderProps) {

    return (
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 p-6 bg-slate-900 rounded-xl border border-slate-800">
            {/* Profile Picture */}
            <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 p-1">
                    <img
                        src={user.profile_picture || "/placeholder.svg"}
                        alt={user.display_name}
                        className="w-full h-full rounded-full object-cover bg-slate-800"
                    />
                </div>
                {/* Online Status Badge */}
                <div className={`absolute bottom-0 right-0 rounded-full w-6 h-6 border-4 border-slate-900 ${user.online_status ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">{user.display_name}</h1>

                <div 
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm border 
                                ${user.online_status ? 
                                    'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    <div className={`w-2 h-2 rounded-full ${user.online_status ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span>{user.online_status ? 'Online' : 'Offline'}</span>
                </div>
            </div>
        </div>
    )
}
