import { useNavigate } from 'react-router-dom';

interface NavBarItemProps {
    link: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    active: boolean;
    onItemClick?: () => void;
}

export default function NavBarItem({ link, icon: Icon, active, onItemClick }: NavBarItemProps) {
    const navigate = useNavigate();

    const activeStyle = active
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";

    return (
        <button
            onClick={() => {
                navigate(link);
                onItemClick?.();
            }}
            className={`w-12 h-12 flex items-center justify-center rounded-xl ${activeStyle} transition-colors`}
        >
            <Icon size={24} />
        </button>
    );
}
