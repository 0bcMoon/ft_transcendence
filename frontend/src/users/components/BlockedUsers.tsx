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
                <p className="text-red-500">Error loading blocked users. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-gray-900">Blocked Users</h2>
                {blockedUsers.length > 0 && (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-base font-medium">
                        {blockedUsers.length}
                    </span>
                )}
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-base text-amber-800 font-medium mb-2">About blocking</p>
                        <p className="text-base text-amber-700">
                            Blocked users cannot see your profile, send you messages, or interact with your content.
                            You can unblock them at any time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Blocked Users List */}
            <div className="max-h-96 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

            {blockedUsers.length === 0 && (
                <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg text-gray-500 mb-2">No blocked users</p>
                    <p className="text-base text-gray-400">Users you block will appear here</p>
                </div>
            )}
        </div>
    );
};

export default BlockedUsers;
