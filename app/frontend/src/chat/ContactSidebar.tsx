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
        return <div className="p-6 text-gray-900 dark:text-white">Loading...</div>;
    }

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed top-16 left-0 right-0 bottom-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed lg:relative top-16 lg:top-auto bottom-0 lg:bottom-auto left-0 z-50 
                            h-[calc(100vh-4rem)] lg:h-full w-full lg:w-100 bg-white dark:bg-gray-950 border-r 
                            border-gray-200 dark:border-gray-900 transform transition-transform duration-300
                            ease-in-out lg:transform-none 
                            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-900">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
                            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Contact List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredChats?.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
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
