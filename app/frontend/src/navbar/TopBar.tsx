import { useState, useRef, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import Notification from "./components/Notification";
import ProfileMenu from "./components/ProfileMenu";
import { useAuthStore } from "@/state/authStore";
import { useGetUnreadCount } from "@/notifications/hooks/useNotificationQueries";

interface TopBarProps {
    onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const user = useAuthStore((state) => state.user);

    // Get unread count
    const { data: unreadCount = 0 } = useGetUnreadCount();

    // Close popovers when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="fixed top-0 left-0 lg:left-20 right-0 h-16 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 z-30">

            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
                <Menu size={20} />
            </button>

            {/* Branding */}
            <div className="hidden lg:flex items-center gap-2 font-bold text-lg tracking-tight">
                <span className="text-white">
                    PONG
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">.1337</span>
                </span>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
                {/* Notification */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationOpen((prev) => !prev)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        <Bell size={20} />
                        {/* Show unread count */}
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {isNotificationOpen && (
                        <Notification onClose={() => setIsNotificationOpen(false)} />
                    )}
                </div>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen((prev) => !prev)}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white hover:opacity-90 transition-all"
                    >
                        <img
                            src={user?.profile_picture || "/default.png"}
                            className="w-10 h-10 rounded-full object-cover"
                            alt="Profile"
                        />
                    </button>
                    {isProfileOpen && <ProfileMenu onClose={() => setIsProfileOpen(false)} />}
                </div>
            </div>
        </header>
    );
}

