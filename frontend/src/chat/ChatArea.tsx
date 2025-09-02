import React, { useState } from 'react';
import { Send, Phone, Video, MoreVertical, Menu, MessageSquare, Shield } from 'lucide-react';
import { Message } from './types';
import { useActiveChatStore } from '@/state/Store';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';

interface ChatAreaProps {
    onSidebarToggle: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
    onSidebarToggle,
}) => {

    const { activeChat } = useActiveChatStore();
    const [newMessage, setNewMessage] = useState('');

    const {data: messages} = useQuery<Message[]>({
        queryKey: ['messages', activeChat?.id],
        queryFn: async () => {
            const respose = await api.get(`/chat/${activeChat?.id}/messages`);
            return respose.data;
        },
        enabled: !!activeChat?.id,
    });



    const handleSendMessage = () => {
        if (newMessage.trim() && activeChat) {
            // In a real app, this would send the message to the backend
            setNewMessage('');
        }
    };


    if (!activeChat) {
        return (
            <div className="flex-1 flex flex-col bg-gray-50">
                <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
                    <button
                        onClick={onSidebarToggle}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="font-semibold text-gray-900">Messages</h1>
                    <div className="w-9" />
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Welcome to Messages
                        </h2>
                        <p className="text-gray-600 max-w-sm">
                            Select a conversation from the sidebar to start chatting with your contacts.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <div className="flex items-center">
                    <button
                        onClick={onSidebarToggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 mr-2"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>

                    <div
                        className="flex items-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors duration-200"
                    >
                        <div className="relative">
                            <img
                                src={activeChat.profile_picture}
                                alt={activeChat.display_name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div
                                className={`absolute bottom-0 right-0 w-3 h-3 
                                        rounded-full border-2 border-white 
                                        ${activeChat.is_online ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                            />
                        </div>
                        <div className="ml-3">
                            <h2 className="font-semibold text-gray-900">{activeChat.display_name}</h2>
                            <p className="text-sm text-gray-500">
                                {activeChat.is_online ? 'Active now' : `Last seen ${activeChat.last_seen}`}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {activeChat.relation_status === 'blocking' ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            <p className="text-gray-600">You have blocked this user</p>
                            <p className="text-sm text-gray-500 mt-1">Unblock to resume conversation</p>
                        </div>
                    </div>
                ) : (
                    messages?.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.is_own
                                    ? 'bg-blue-500 text-white rounded-br-md'
                                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'}`}
                            >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                                <p
                                    className={`text-xs mt-1 ${message.is_own ? 'text-blue-100' : 'text-gray-500'}`}
                                >
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Message Input */}
            {!(activeChat.relation_status ==='blocking') && (
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-end space-x-3">
                        <div className="flex-1">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                                rows={1}
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full transition-colors duration-200 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
