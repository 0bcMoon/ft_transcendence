import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MessageNotificationProps {
    username?: string;
    content?: string;
    profile_picture?: string;
    onClose: () => void;
}

export const MessageNotification = ({ username, content, profile_picture, onClose }: MessageNotificationProps) => {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate("/chat")}
            className="flex items-center bg-gray-800 rounded-lg shadow-lg p-4 w-80 cursor-pointer hover:bg-gray-700 transition-colors" >
            <img
                src={profile_picture}
                alt={username}
                className="w-12 h-12 rounded-full object-cover mr-4"
            />

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{username}</h3>
                <p className="text-gray-300 text-sm truncate">{content}</p>
            </div>

            <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onClose(); 
                }} 
                className="ml-4 text-gray-400 hover:text-white focus:outline-none" >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};
