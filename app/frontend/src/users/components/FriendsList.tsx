import { useCallback, useEffect, useState } from 'react';
import { Search, MessageCircle, UserX, Users } from 'lucide-react';
import UserCard from './UserCard';
import LoadingSpinner from './LoadingSpinner';
import { useFriends } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useActiveChatStore } from '@/state/Store';
import Modal from '@/component/Model';
import { RemoteUser } from '@/types/types';
import { useUnFriend } from '@/api/mutations';
import { unsubscribe } from '@/home/Notification';
import { useWebSocket } from '@/context/WebSocketContext';
import toast from 'react-hot-toast';

const FriendsList = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const { data: friends = [], isLoading, error } = useFriends();
    const navigate = useNavigate();
    const setActiveChat = useActiveChatStore(state => state.setActiveChat);
    const [currentUserId, setcurrentUserId] = useState<number | undefined>(undefined);
    const { mutate: unfriend, isPending: isUnfriending } = useUnFriend();

    // TODO: implementing websocket reconnection to get real-time online status
    const { socket } = useWebSocket();
    const isConnected = socket && socket.readyState === WebSocket.OPEN;

    // Filter friends based on search term
    const filteredFriends = useCallback(() => {
        return friends.filter((friend) =>
            friend.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (friend.username && friend.username.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [friends, searchTerm])();

    const friends_id = friends.map((friend) => friend.id);

    useEffect(() => {
        return () => {
            if (!socket || !isConnected || isLoading || friends_id.length === 0) return;
            toast.success(`unSubscribed to friends' presence ${friends_id.join(', ')}`);
            unsubscribe(socket, friends_id);
        };
    }, [isLoading, isConnected, socket]);



    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Error loading friends. Please try again.</p>
            </div>
        );
    };
    const startChat = (user: RemoteUser) => {
        setActiveChat(user);
        navigate("/chat");
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                />
            </div>

            {/* Friends Count */}
            <div className="flex items-center justify-between">
                <p className="text-base text-gray-600 font-medium">
                    {filteredFriends.length} {filteredFriends.length === 1 ? 'friend' : 'friends'}
                </p>
            </div>

            {/* Friends Grid */}

            <Modal
                isOpen={currentUserId !== undefined}
                onClose={() => setcurrentUserId(undefined)}
                onDeny={() => setcurrentUserId(undefined)}
                onAccept={() => { unfriend({ user_id: currentUserId! }); setcurrentUserId(undefined) }}
                title={'Unfriend User'}
                message={'Are you sure you want to unfriend this user?'}
                acceptText={'Unfriend'}
                type='warning'
                denyText="Cancel"
            />

            <div className="max-h-96 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredFriends.map((friend) => (
                        <UserCard
                            showOnlineStatus={true}
                            key={friend.id}
                            user={friend}
                            actions={[
                                {
                                    label: 'Message',
                                    icon: MessageCircle,
                                    onClick: () => startChat(friend),
                                    primary: true,
                                },
                                {
                                    disabled: isUnfriending,
                                    label: 'Unfriend',
                                    icon: UserX,
                                    onClick: () => setcurrentUserId(friend.id),
                                    destructive: true,
                                },
                            ]}
                        />
                    ))}
                </div>
            </div>

            {friends.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No friends found</p>
                </div>
            )}
        </div>
    );
};

export default FriendsList;
