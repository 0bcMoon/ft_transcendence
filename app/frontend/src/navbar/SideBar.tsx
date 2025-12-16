import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/state/authStore';
import {
    Home, Settings, Gamepad2, ContactRound,
    MessageCircle, User2, History
} from 'lucide-react';
import NavBarItem from './components/NavBarItem';

interface SideBarProps {
    isSidebarOpen: boolean;
    onClose: () => void;
}


export default function SideBar({ isSidebarOpen, onClose }: SideBarProps) {
    const currentUser = useAuthStore((s) => s.user);
    const location = useLocation();

    const navItems = [
        { link: "/", label: "Home", icon: Home },
        { link: "/game", label: "Game", icon: Gamepad2 },
        { link: "/chat", label: "Chat", icon: MessageCircle },
        { link: "/users", label: "Friends", icon: ContactRound },
        { link: "/history", label: "History", icon: History },
        { link: currentUser ? `/users/${currentUser.id}` : "/users", label: "Profile", icon: User2 },
        { link: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <>
            {/* Backdrop - Mobile only */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar - Floating, centered vertically */}
            <aside
                className={`fixed left-0 top-1/2 -translate-y-1/2 z-50
                            w-20 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl
                            transform transition-all duration-300 ease-in-out
                            dark:bg-slate-900/90 dark:border-slate-700/50
                            ${isSidebarOpen ? 'translate-x-0 scale-100' : '-translate-x-full scale-95 lg:translate-x-0 lg:scale-100'}`} >

                {/* Navigation */}
                <nav className="flex flex-col items-center py-8 space-y-4">
                    {navItems.map((item) => (
                        <NavBarItem
                            key={item.link}
                            link={item.link}
                            label={item.label}
                            active={location.pathname === item.link}
                            icon={item.icon}
                            onItemClick={onClose}
                        />
                    ))}
                </nav>
            </aside>
        </>
    );
}
