import React, { useEffect, useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Contacts, } from './types';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import { ContactList } from './components/ContactList';
import { useActiveChatStore } from '@/state/Store';
import { useWebSocket } from '@/context/WebSocketContext';
import { unsubscribe } from '@/home/Notification';
import toast from 'react-hot-toast';

// const ChatRequest = () => {
//     const chatRequests: ChatRequest[] = []; // This should come from props or state
//     return (
//
//                     {/* Chat Requests */}
//                         <div className="border-b border-gray-100">
//                             <div className="p-4">
//                                 <div className="flex items-center mb-3">
//                                     <UserPlus className="w-5 h-5 text-blue-600 mr-2" />
//                                     <h2 className="font-semibold text-gray-900">Chat Requests</h2>
//                                     <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
//                                         {chatRequests.length}
//                                     </span>
//                                 </div>
//
//                                 <div className="space-y-3">
//                                     {chatRequests.map((request) => (
//                                         <div
//                                             key={request.id}
//                                             className="bg-blue-50 rounded-lg p-3 border border-blue-100"
//                                         >
//                                             <div className="flex items-start space-x-3">
//                                                 <div
//                                                     className="cursor-pointer"
//                                                     onClick={() => onProfileClick(request.user)}
//                                                 >
//                                                     <img
//                                                         src={request.user.avatar}
//                                                         alt={request.user.name}
//                                                         className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-200 hover:ring-blue-300 transition-all duration-200"
//                                                     />
//                                                 </div>
//
//                                                 <div className="flex-1 min-w-0">
//                                                     <div className="flex items-center justify-between mb-1">
//                                                         <h4 className="font-medium text-gray-900 truncate">
//                                                             {request.user.name}
//                                                         </h4>
//                                                         <span className="text-xs text-gray-500">
//                                                             {request.timestamp}
//                                                         </span>
//                                                     </div>
//                                                     <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//                                                         {request.message}
//                                                     </p>
//
//                                                     {/* Action Buttons */}
//                                                     <div className="flex space-x-2">
//                                                         <button
//                                                             onClick={() => onAcceptRequest(request.id)}
//                                                             className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
//                                                         >
//                                                             <Check className="w-4 h-4 mr-1" />
//                                                             Accept
//                                                         </button>
//                                                         <button
//                                                             onClick={() => onDenyRequest(request.id)}
//                                                             className="flex items-center px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
//                                                         >
//                                                             <X className="w-4 h-4 mr-1" />
//                                                             Deny
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//     )
// }

interface ContactSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ContactSidebar: React.FC<ContactSidebarProps> = ({
    isOpen,
    onClose,
}) => {

    const setActiveChat = useActiveChatStore(state => state.setActiveChat);
    const { socket } = useWebSocket();
    const isConnected = socket && socket.readyState === WebSocket.OPEN;
    const { data: chats, isLoading } = useQuery<Contacts[]>({
        queryKey: ['contacts'],
        queryFn: async () => {
            const response = await api.get('/api/chat/contacts');
            return response.data;
        },
    });

    const [searchTerm, setSearchTerm] = useState('');
    const handleChatSelect = (chat: any) => {
        setActiveChat(chat);
        onClose();
    };

    const filteredChats = chats?.filter(chat =>
        chat.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const contacts_ids = chats?.map((chat) => chat.id) || [];
    useEffect(() => {
        return () => {
            if (!socket || !isConnected || isLoading || contacts_ids.length === 0) return;
            toast.success(`unSubscribed to contacts' presence ${contacts_ids.join(', ')}`);
            unsubscribe(socket, contacts_ids);
        };
    }, [isLoading, isConnected, socket]);

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed lg:relative inset-y-0 left-0 z-50 w-100 bg-white border-r 
                            border-gray-200 transform transition-transform duration-300
                            ease-in-out lg:transform-none 
                            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>


                    {/* Contact List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredChats?.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No conversations found</p>
                            </div>
                        ) : (
                            <ContactList chats={filteredChats} onChatSelect={handleChatSelect} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};


