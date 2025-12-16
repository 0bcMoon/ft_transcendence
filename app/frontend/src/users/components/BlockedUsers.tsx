import { UserCheck, Shield } from 'lucide-react';
import UserCard from './UserCard';
import LoadingSpinner from './LoadingSpinner';
import { useBlockedUsers } from '../hooks/useApi';
import { useBlockUser } from '@/api/mutations';

const BlockedUsers = () => {
    const { data: blockedUsers = [], isLoading, error } = useBlockedUsers();
    const { mutate: blockAction, isPending } = useBlockUser();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400 font-semibold">Error loading blocked users</p>
                <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">Please try again later</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blocked Users</h2>
                {blockedUsers.length > 0 && (
                    <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1. 5 rounded-lg text-sm font-semibold border border-red-200 dark:border-red-500/30">
                        {blockedUsers.length}
                    </span>
                )}
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-5">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-base text-amber-900 dark:text-amber-300 font-semibold mb-1">About Blocking</p>
                        <p className="text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
                            Blocked users cannot see your profile, send you messages, or interact with your content.
                            You can unblock them at any time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Blocked Users List */}
            {blockedUsers.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {blockedUsers.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                showBlockedDate
                                actions={[
                                    {
                                        isLoading: isPending,
                                        disabled: isPending,
                                        label: 'Unblock',
                                        icon: UserCheck,
                                        onClick: () => blockAction({ action: false, user_id: user.id }),
                                        primary: true,
                                    },
                                ]}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-10 h-10 text-gray-400 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Blocked Users</h3>
                    <p className="text-gray-600 dark:text-slate-400">Users you block will appear here</p>
                </div>
            )}
        </div>
    );
};

export default BlockedUsers;
