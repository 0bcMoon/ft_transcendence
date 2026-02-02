import { Link } from "react-router-dom"
import { useGetNotifications } from "@/notifications/hooks/useNotificationQueries"
import { useMarkAsRead } from "@/notifications/hooks/useNotificationMutations"
import { timeAgo } from "@/utils/utils"

interface NotificationProps {
    onClose?: () => void
}

export default function Notification({ onClose }: NotificationProps) {
    const { data: notifications = [], isLoading, isError } = useGetNotifications(1, 5)
    const { mutate: markAsRead } = useMarkAsRead()

    const handleClick = (id: number, isRead: boolean) => {
        if (!isRead) markAsRead(id)
        onClose?.()
    }

    const containerClass = "absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl"

    if (isLoading) {
        return (
            <div className={containerClass}>
                <div className="p-4 text-center text-slate-400">Loading...</div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className={containerClass}>
                <div className="p-4 text-center text-red-400">Failed to load notifications</div>
            </div>
        )
    }

    return (
        <div className={containerClass}>
            {/* Header */}
            <div className="border-b border-slate-700 p-4">
                <h3 className="font-semibold text-white">Notifications</h3>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No notifications</div>
                ) : (
                    notifications.map((notification) => {
                        const isRead = Boolean(notification.is_read)

                        const content = (
                            <div className="flex items-start gap-3">
                                {!isRead && (
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-white">
                                        {notification.title}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                                        {notification.message}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {timeAgo(notification.created_at)}
                                    </p>
                                </div>
                            </div>
                        )

                        const itemClass = "block cursor-pointer border-b border-slate-800 p-4 transition hover:bg-slate-800 last:border-b-0"

                        return notification.link ? (
                            <Link
                                key={notification.id}
                                to={notification.link}
                                onClick={() => handleClick(notification.id, isRead)}
                                className={itemClass}
                            >
                                {content}
                            </Link>
                        ) : (
                            <div
                                key={notification.id}
                                onClick={() => handleClick(notification.id, isRead)}
                                className={itemClass}
                            >
                                {content}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="border-t border-slate-700 p-3 text-center">
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="inline-block w-full text-sm font-medium text-blue-400 transition hover:text-blue-300"
                    >
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    )
}
