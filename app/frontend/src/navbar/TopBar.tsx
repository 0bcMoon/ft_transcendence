import { useState, useRef, useEffect } from 'react';
import { Bell, User, Menu } from 'lucide-react';
import DarkModeToggle from '@/component/DarkModeToggle';
import Notification from './components/Notification';
import ProfileMenu from './components/ProfileMenu';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
    onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 
                         flex items-center justify-between px-6 z-30
                         dark:bg-slate-950 dark:border-slate-800">

            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg 
                           text-gray-600 hover:bg-gray-100 transition-colors
                           dark:text-gray-300 dark:hover:bg-slate-800"
            >
                <Menu size={20} />
            </button>

            {/* Logo - Left side */}
            <div onClick={() => navigate('/') } className="flex items-center gap-2. 5 font-bold text-xl tracking-tight">
                <div className="relative">
                    <div className="relative w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                            {/* Paddle */}
                            <path
                                d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6. 13401 17 10 17C10.5523 17 11 17.4477 11 18V22C11 22.5523 10.5523 23 10 23H10C9.44772 23 9 22. 5523 9 22V18C9 17.4477 8.55228 17 8 17C4.13401 17 1 13. 866 1 10C1 6.13401 4.13401 3 8 3H10Z"
                                fill="currentColor"
                                opacity="0.9"
                            />
                            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2. 5" fill="none" />
                            <rect x="8" y="16" width="4" height="6" rx="2" fill="currentColor" />

                            {/* Ball with motion trail */}
                            <circle cx="18" cy="6" r="3" fill="currentColor" opacity="0.3" />
                            <circle cx="19" cy="5. 5" r="3" fill="currentColor" opacity="0.5" />
                            <circle cx="20" cy="5" r="3" fill="currentColor" />
                            <circle cx="20. 5" cy="4.5" r="1.2" fill="white" opacity="0.8" />
                        </svg>

                    </div>
                </div>
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    PONG<span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">.1337</span>
                </span>
            </div>

            {/* Search Area (Empty for now) */}
            <div className="flex-1 max-w-xl mx-6" />

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
                <DarkModeToggle />

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors
                                   dark:text-gray-300 dark:hover:bg-slate-800"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
                    </button>
                    {isNotificationOpen && <Notification />}
                </div>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-lg"
                    >
                        <User size={20} />
                    </button>
                    {isProfileOpen && <ProfileMenu onClose={() => setIsProfileOpen(false)} />}
                </div>
            </div>
        </header>
    );
}
