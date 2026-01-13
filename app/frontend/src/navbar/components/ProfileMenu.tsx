import { Home, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileMenuProps {
    onClose: () => void
}

export default function ProfileMenu({ onClose }: ProfileMenuProps) {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleNavigation = (path: string) => {
        navigate(path)
        onClose()
    }
    const queryClient = useQueryClient();

    return (
        <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-lg shadow-lg border border-slate-700 py-2 z-50">
            <button
                onClick={() => handleNavigation("/")}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-slate-800 flex items-center space-x-3 transition-colors"
            >
                <Home size={18} />
                <span>Go Home</span>
            </button>

            <button
                onClick={() => handleNavigation("/settings")}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-slate-800 flex items-center space-x-3 transition-colors"
            >
                <Settings size={18} />
                <span>Settings</span>
            </button>

            <div className="border-t border-slate-700 my-2"></div>

            <button
                onClick={() => {
                    logout()
                    queryClient.invalidateQueries() // Invalidate all queries on logout
                    onClose()
                }}
                className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-950 flex items-center space-x-3 transition-colors"
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </div>
    )
}

