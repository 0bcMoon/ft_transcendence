import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
    src?: string;
    alt?: string;
    name: string;
    isOnline: boolean;
    size?: 'sm' | 'md' | 'md2' | 'lg' | 'xl';
    showName?: boolean;
    className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    src,
    alt,
    name,
    isOnline,
    size = 'md',
    showName = false,
    className = '',
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        md2: 'w-14 h-14',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20',
    };

    const statusSizeClasses = {
        sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
        md: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',

        md2: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
        lg: 'w-4 h-4 -bottom-1 -right-1',
        xl: 'w-5 h-5 -bottom-1 -right-1',
    };


    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        md2: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10',
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative">
                <div
                    className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg ring-2 ring-white transition-all duration-300 hover:shadow-xl hover:scale-105`}
                >
                    {src ? (
                        <img
                            src={src}
                            alt={alt || name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <User className={`${iconSizeClasses[size]} text-gray-600`} />
                    )}
                </div>

                {/* Status indicator */}
                <div
                    className={`absolute ${statusSizeClasses[size]} rounded-full border-2 border-white shadow-sm transition-all duration-300 ${isOnline
                        ? 'bg-green-500 shadow-green-500/50'
                        : 'bg-gray-400 shadow-gray-400/50'
                        }`}
                >
                    {isOnline && (
                        <div className="w-full h-full rounded-full bg-green-400 animate-pulse" />
                    )}
                </div>
            </div>

            {showName && (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900 text-sm">
                        {name}
                    </span>
                    <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'
                        }`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
