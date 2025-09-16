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
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    actions = [],
    showRequestDate = false,
    showBlockedDate = false,
}) => {

    const navigate = useNavigate();
    const visitProfile = () => {
        navigate(`/users/${user.id}`);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
            {/* User Info */}
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="relative">
                    <img
                        onClick={visitProfile}
                        src={user.profile_picture}
                        alt={user.display_name}
                        className="w-16 h-16 rounded-full object-cover"
                    />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <h3 onClick={visitProfile} className="hover:text-blue-700 hover:underline hover:cursor-pointer text-lg font-semibold text-gray-900 truncate">{user.display_name}</h3>
                    {user.username && <p className="text-sm text-gray-500 truncate">@{user.username}</p>}

                    {showRequestDate && 'created_at' in user && (
                        <p className="text-sm text-gray-500 mt-2">
                            Request sent {formatTimeToReadable(user.created_at)}
                        </p>
                    )}

                    {showBlockedDate && 'created_at' in user && (
                        <p className="text-sm text-gray-500 mt-2">
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
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : action.primary
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                                            : action.destructive
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : action.primary
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                                            : action.destructive
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
