// src/components/profile/ProfileHeader. tsx

import { RemoteUser } from '@/types/types';

interface ProfileHeaderProps {
    user: RemoteUser;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-xl">
                    <img
                        src={user.profile_picture}
                        alt={user.display_name}
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                {/* Online Status Badge */}
                <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-2 border-4 border-white dark:border-slate-900 shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg: text-left w-full">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {user.display_name}
                </h1>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-xl font-semibold text-sm border border-green-200 dark: border-green-500/20">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online Now</span>
                </div>
            </div>
        </div>
    );
}
