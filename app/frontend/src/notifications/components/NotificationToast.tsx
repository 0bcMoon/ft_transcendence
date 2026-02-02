import { X } from 'lucide-react';
import type { Notifications } from '../types';
import { Link } from 'react-router-dom';

interface NotificationToastProps {
    notification: Notifications;
    sender?: {
        name: string;
        profile_picture: string;
    };
    onClose: () => void;
}

export const NotificationToast = ({ notification, sender, onClose }: NotificationToastProps) => {
    const content = (
        <div className="flex items-center bg-slate-900 rounded-lg shadow-xl border border-slate-700 p-4 w-80 max-w-[90vw] animate-slide-in cursor-pointer group">
            {sender && (
                <img
                    src={sender.profile_picture}
                    alt={sender.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700 mr-4"
                    loading="lazy"
                />
            )}

            <div className="flex-1 min-w-0">
                <h4
                    className="font-semibold text-white text-base truncate"
                    title={notification.title}
                >
                    {notification.title}
                </h4>

                {sender && (
                    <div className="text-xs text-slate-400 font-medium truncate">
                        {sender.name}
                    </div>
                )}

                <p
                    className="text-slate-300 text-sm truncate"
                    title={notification.message}
                >
                    {notification.message}
                </p>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                aria-label="Close notification"
                className="ml-4 text-slate-400 hover:text-white focus:outline-none transition-colors"
                type="button"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );

    return notification.link ? (
        <Link to={notification.link} onClick={onClose}>
            {content}
        </Link>
    ) : (
        content
    );
};

