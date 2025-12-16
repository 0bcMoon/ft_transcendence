import { Home, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileMenuProps {
    onClose: () => void;
}

export default function ProfileMenu({ onClose }: ProfileMenuProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 dark:bg-slate-900 dark:border-slate-700">
            <button
                onClick={() => handleNavigation('/')}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors dark:text-gray-300 dark:hover:bg-slate-800"
            >
                <Home size={18} />
                <span>Go Home</span>
            </button>

            <button
                onClick={() => handleNavigation('/settings')}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors dark:text-gray-300 dark:hover:bg-slate-800"
            >
                <Settings size={18} />
                <span>Settings</span>
            </button>

            <div className="border-t border-gray-200 my-2 dark:border-slate-700"></div>

            <button
                onClick={() => {
                    logout();
                    onClose();
                }}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors dark:text-red-500 dark:hover:bg-red-950"
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </div>
    );
}
