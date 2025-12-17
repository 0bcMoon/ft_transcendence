export default function Notification() {
    const notifications = [
        { id: 1, title: "New Match", message: "You have a new game invitation", time: "2m ago" },
        { id: 2, title: "Achievement Unlocked", message: "You reached level 10!", time: "1h ago" },
        { id: 3, title: "Friend Request", message: "John wants to connect", time: "3h ago" },
    ]

    return (
        <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold text-white">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="p-4 border-b border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm">{notification.title}</p>
                                <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                                <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 text-center border-t border-slate-700">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    View all notifications
                </button>
            </div>
        </div>
    )
}

