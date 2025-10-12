import { Home, Settings, MessageSquare, Gamepad2, Bell, Search, User, Menu, X, LogOut, ContactRound, BarChart2, MessageCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NavBarItemProps {
    link: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    active: boolean;
}
function NavBarItem({ link, label, icon: Icon, active }: NavBarItemProps) {
    const activeStyle = active ? "text-black bg-gray-100" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50";
    return (
        <button className={`w-12 h-12 flex items-center justify-center rounded-xl  text-white ${activeStyle} transition-colors`}>
            <Icon size={24}/>
        </button>
    )

}


function NavBar({ children }: { children: React.ReactNode }) {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    const navItems = [

        { link: "/",         label: "Home",     icon: Home,          active: true },
        { link: "/game",     label: "Game",     icon: Gamepad2,      active: true },
        { link: "/chat",     label: "Chat",     icon: MessageCircle, active: true },
        { link: "/stats",    label: "Stats",    icon: BarChart2,     active: true },
        { link: "/users",    label: "Friends",  icon: ContactRound,     active: true },
        { link: "/history",  label: "History",  icon: History,          active: true },
        { link: "/settings", label: "Settings", icon: Settings,         active: true },
        { link: "/profile",  label: "Profile",  icon: User,             active: true },
    ];

    return (
    <div className="min-h-screen bg-white flex no-scrollbar">
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={` fixed lg:static inset-y-0 left-0 z-40
                        w-20 bg-white border-r border-gray-200 flex flex-col items-center py-8 space-y-8
                        transform transition-transform duration-300 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
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
                            active={item.active}
                            icon={item.icon}
                        />
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-6 pl-16 lg:pl-6">
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 ml-6">
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                            </button>

                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <MessageSquare size={20} className="text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800">New message from John</p>
                                                    <p className="text-xs text-gray-500 mt-1">Hey, are you available for a quick chat?</p>
                                                    <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Gamepad2 size={20} className="text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800">Game invitation</p>
                                                    <p className="text-xs text-gray-500 mt-1">Sarah invited you to play Chess</p>
                                                    <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <MessageSquare size={20} className="text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800">3 new messages</p>
                                                    <p className="text-xs text-gray-500 mt-1">You have unread messages in Team Chat</p>
                                                    <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Gamepad2 size={20} className="text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800">Game completed</p>
                                                    <p className="text-xs text-gray-500 mt-1">You won against Mike in Tic Tac Toe!</p>
                                                    <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                            >
                                <User size={20} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                                        <Home size={18} />
                                        <span>Go Home</span>
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                                        <Settings size={18} />
                                        <span>Settings</span>
                                    </button>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors">
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 bg-gray-50 p-6">
                    {/* <div className="max-w-7xl mx-auto"> */}
                    {children}
                    {/* </div> */}
                </main>
            </div>
        </div>
    );
}

export default NavBar;
