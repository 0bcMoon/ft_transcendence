
import { Home, MessageCircle, Gamepad2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

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
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors duration-200 ${isActive ? "text-black bg-gray-100" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    aria-label={label}
                >
                    <Icon size={24} className={`mb-1 ${isActive ? "stroke-2" : "stroke-1.5"}`} />
                    <span className={`text-xs font-medium ${isActive ? "text-black" : "text-gray-500"}`}>
                    </span>
                    {label}
                </button>
            </li>
        </Link >
    )
}

const NavigationBar = () => {

    const navItems: NavigationItemProps[] = [
        { isActive: false, link: "/home", label: "Home", icon: Home },
        { isActive: false, link: "/chat", label: "Chat", icon: MessageCircle },
        { isActive: false, link: "/game", label: "Game", icon: Gamepad2 },
        { isActive: false, link: "/settings", label: "Settings", icon: Settings },
    ]
    console.log("HEllo world")

    return (
        <div
            className="flex flex-col  flex-nowrap rounded-2xl items-center 
                        bg-white-200 h-[97svh]  justify-center
                        gap-4
                        col-span-1
                        border-gray-100 border-2 shadow-lg shadow-gray-200"
        >
            {
                navItems.map((item) => {
                    return <NavigationItem key={item.label} {...item} />
                })
            }
        </div>
    )
}


export default NavigationBar;
