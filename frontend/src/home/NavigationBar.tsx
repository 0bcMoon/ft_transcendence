import { Home, MessageCircle, Gamepad2, Settings, LogOut, History, ContactRound, BarChart2, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from '@/context/AuthContext';

interface NavigationItemProps {
    link: string;
    isActive: boolean;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NavigationItem = ({ label, icon: Icon, isActive, link }: NavigationItemProps) => {
    return (
        <Link to={link}>
            <li className="list-none">
                <button
                    className={`flex flex-col items-center justify-center p-3 
                                    rounded-lg transition-colors duration-200 w-full  
                                    ${isActive ?
                            "text-black bg-gray-100" :
                            "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    aria-label={label}
                >
                    <Icon size={24} className={`mb-1 ${isActive ? "stroke-2" : "stroke-1.5"}`} />
                    <span
                        className=
                        {`text-xs font-medium 
                                        ${isActive ? "text-black" : "text-gray-500"}`
                        }
                    >
                        {label}
                    </span>
                </button>
            </li>
        </Link >
    )
}

const Logout = () => {

    const { logout } = useAuth();

    return (
        <Link onClick={logout} to="/login" className="mt-auto md:w-full">
            <li className="list-none">
                <button
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors 
                                    duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 w-full`}
                    aria-label="Logout"
                >
                    <LogOut size={24} className="mb-1 stroke-1.5" />
                    <span className="text-xs font-medium text-gray-500">Logout</span>
                </button>
            </li>
        </Link>
    )
}

const NavigationBar = () => {
    const location = useLocation(); // Get current location

    const navItemsData = [

        { link: "/", label: "Home", icon: Home },
        { link: "/chat", label: "Chat", icon: MessageCircle },
        { link: "/game", label: "Game", icon: Gamepad2 },
        { link: "/users", label: "Friends", icon: ContactRound },
        { link: "/stats", label: "Stats", icon: BarChart2 },
        { link: "/history", label: "History", icon: History },
        { link: "/settings", label: "Settings", icon: Settings },
        { link: "/profile", label: "Profile", icon: User },

    ];

    return (
        <nav
            className="lg:flex hidden flex-row items-center justify-around bg-white shadow-lg fixed bottom-0 left-0 right-0 z-50 border-t-2 border-gray-100 p-2
                       md:flex-col md:justify-center md:gap-4 md:relative md:z-auto md:border-2 md:rounded-2xl md:h-[97svh] md:col-span-1 col-span-1"
        >
            {/* Main navigation items */}
            {navItemsData.map((item) => {
                const isActive = location.pathname === (item.link); // Basic active state check
                return <NavigationItem key={item.label} {...item} isActive={isActive} />

            })}

            <Logout />
        </nav>
    )
}

export default NavigationBar;
