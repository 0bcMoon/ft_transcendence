import React from 'react';
import { Request, BlockedUser } from '../types/User';
import { formatTimeToReadable } from '@/component/helper';
import { RemoteUser } from '@/types/types';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionButton {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    primary?: boolean;
    destructive?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
}

interface UserCardProps {
    user: Request | RemoteUser | BlockedUser;
    actions?: ActionButton[];
    showRequestDate?: boolean;
    showBlockedDate?: boolean;
    showOnlineStatus?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    actions = [],
    showRequestDate = false,
    showBlockedDate = false,
    showOnlineStatus = false,
}) => {

    const navigate = useNavigate();
    const visitProfile = () => {
        navigate(`/users/${user.id}`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">

            <div className="flex items-start gap-4 mb-4">

                <div className="relative">
                    <img
                        onClick={visitProfile}
                        src={user.profile_picture}
                        alt={user.display_name}
                        className="w-16 h-16 rounded-full object-cover cursor-pointer"
                    />
                    {showOnlineStatus && (
                        <div
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800
                                    ${user.online_status ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}`}
                        />)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <h3 onClick={visitProfile} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline hover:cursor-pointer text-lg font-semibold text-gray-900 dark:text-white truncate">{user.display_name}</h3>
                    {user.username && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>}

                    {showRequestDate && 'created_at' in user && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Request sent {formatTimeToReadable(user.created_at)}
                        </p>
                    )}

                    {showBlockedDate && 'created_at' in user && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Blocked {formatTimeToReadable(user.created_at)}
                        </p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            {actions.length > 0 && (
                <div className="flex gap-3">
                    {actions.length === 1 ? (
                        // Single action as full-width button
                        actions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${action.disabled
                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                        : action.primary
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                                            : action.destructive
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 active:bg-red-200 dark:active:bg-red-900/40'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >

                                    {action.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    {action.label}
                                </button>
                            );
                        })
                    ) : (
                        // Multiple actions as individual buttons
                        actions.slice(0, 2).map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${action.disabled
                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                        : action.primary
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                                            : action.destructive
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 active:bg-red-200 dark:active:bg-red-900/40'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {action.label}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default UserCard;
