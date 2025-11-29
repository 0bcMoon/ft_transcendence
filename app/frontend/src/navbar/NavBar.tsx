import DarkModeToggle from "../component/DarkModeToggle";
import { useAuth } from '@/context/AuthContext';
import {
    Home, Settings, MessageSquare, Gamepad2, Bell,
    User, Menu, LogOut, ContactRound,
    MessageCircle, User2, History,
} from 'lucide-react';

import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavBarItemProps {
    link: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    active: boolean;
}

interface NavBarProps {
    onItemClick?: () => void;
}

function NavBarItem({ link, icon: Icon, active, onItemClick }: NavBarItemProps & NavBarProps) {

    const navigate = useNavigate();

    const activeStyle = !active ?
        "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" :
        "bg-blue-600 text-white hover:bg-blue-700";

    return (
        <button
            onClick={() => {
                navigate(link);
                onItemClick?.();
            }}
            className={`w-12 h-12 flex items-center justify-center rounded-xl ${activeStyle} transition-colors`} > <Icon size={24} />
        </button>
    )
}

function Notification() {
    return (
        <div className="fixed sm:absolute top-16 sm:top-auto right-4 sm:right-0 left-4 sm:left-auto mt-0 sm:mt-2 w-auto sm:w-80 
                       bg-white rounded-lg shadow-lg border border-gray-200 z-50
                       dark:bg-gray-900 dark:border-gray-700">

            <div className="max-h-96 overflow-y-auto">
                <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 dark:bg-blue-900">
                            <MessageSquare size={20} className="text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">New message from John</p>
                            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Hey, are you available for a quick chat?</p>
                            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">2 minutes ago</p>
                        </div>
                    </div>
                </button>

                <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 dark:hover:bg-gray-800 dark:border-gray-800">
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 dark:bg-green-900">
                            <Gamepad2 size={20} className="text-green-600 dark:text-green-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Game invitation</p>
                            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Sarah invited you to play Chess</p>
                            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">15 minutes ago</p>
                        </div>
                    </div>
                </button>

            </div>
        </div>
    )
}


function NavBar({ children }: { children: React.ReactNode }) {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const { logout } = useAuth();

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

    const navItems = [
        { link: "/", label: "Home", icon: Home, },
        { link: "/game", label: "Game", icon: Gamepad2, },
        { link: "/chat", label: "Chat", icon: MessageCircle, },
        { link: "/users", label: "Friends", icon: ContactRound, },
        { link: "/history", label: "History", icon: History, },
        { link: "/settings", label: "Settings", icon: Settings, },
        { link: "/profile", label: "Profile", icon: User2, },
    ];

    return (
        <div className="flex no-scrollbar h-screen">
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="fixed top-4 left-4 z-[70] lg:hidden w-10 h-10 flex items-center 
                               justify-center rounded-lg bg-white border border-gray-200 text-gray-600
                               hover:bg-gray-50 transition-colors
                               dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" >
                    <Menu size={20} />
                </button>
            )}

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-[60]
                            w-20 bg-white border-r border-gray-200 flex flex-col items-center py-8 space-y-8
                            transform transition-transform duration-300 ease-in-out
                            dark:bg-gray-950 dark:border-gray-800
                            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                onClick={() => {
                    if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                    }
                }}
            >
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-lg"></div>
                </div>
                <nav className="flex-1 flex flex-col items-center space-y-6 mt-8">
                    {navItems.map((item) => (
                        <NavBarItem
                            key={item.link}
                            link={item.link}
                            label={item.label}
                            active={location.pathname === item.link}
                            icon={item.icon}
                            onItemClick={() => setIsSidebarOpen(false)}
                        />
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col h-full ">
                <header className="fixed top-0 right-0 left-0 lg:left-20 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-6 pl-16 lg:pl-6 z-30
                                 dark:bg-gray-950 dark:border-gray-800">
                    <div className="flex-1 max-w-xl">
                    </div>

                    <div className="flex items-center space-x-4 ml-6">

                        <DarkModeToggle />

                        <div className="relative sm:relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors
                                           dark:text-gray-300 dark:hover:bg-gray-800" >
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                            </button>
                            {isNotificationOpen && <Notification />}
                        </div>

                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors" >
                                <User size={20} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 dark:bg-gray-900 dark:border-gray-700">

                                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors dark:text-gray-300 dark:hover:bg-gray-800">
                                        <Home size={18} />
                                        <span>Go Home</span>
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors dark:text-gray-300 dark:hover:bg-gray-800">
                                        <Settings size={18} />
                                        <span>Settings</span>
                                    </button>

                                    <div className="border-t border-gray-200 my-2 dark:border-gray-700"></div>

                                    <button
                                        onClick={() => logout()}
                                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors dark:text-red-500 dark:hover:bg-red-950">
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mt-16 flex-1 bg-gray-50 overflow-auto dark:bg-gray-900">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default NavBar;
