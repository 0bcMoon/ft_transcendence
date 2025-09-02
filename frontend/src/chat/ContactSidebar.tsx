import React, { useState } from 'react';
import { Search, MessageSquare, MoreVertical, Shield } from 'lucide-react';
import {  Contacts, } from './types';
import { useActiveChatStore } from '@/state/Store';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';


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

    // TODO: add lo
    const {data: chats} = useQuery<Contacts[]>({
        queryKey: ['contacts'],
        queryFn: async () => {
            const response = await api.get('/chat/contacts');
            return response.data;
        },
    });

    const { activeChat, setActiveChat } = useActiveChatStore();

    const [searchTerm, setSearchTerm] = useState('');


    const handleChatSelect = (chat: any) => {
        setActiveChat(chat);
        onClose();
    };


    const filteredChats = chats?.filter(chat =>
        chat.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            <div className="p-2">
                                {filteredChats?.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => handleChatSelect(chat)}
                                        className={`relative flex items-center p-4 rounded-lg cursor-pointer 
                                                    transition-all duration-200 hover:bg-gray-50 group 
                                                    ${activeChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className="relative cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <img
                                                src={chat.profile_picture}
                                                alt={chat.display_name}
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 hover:ring-blue-200 transition-all duration-200"
                                            />
                                            <div
                                                    // TODO: for online find a better way
                                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white 
                                                            ${true ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}
                                            />
                                        </div>

                                        {/* Chat Info */}
                                        <div className="flex-1 ml-3 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {chat.display_name}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {chat.messsage_time? new Date(chat.messsage_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate mt-1">
                                                {chat.relation_status === 'blocking' ? (
                                                    <span className="text-red-500 italic">User blocked</span>
                                                ) : (
                                                    chat.content || <span className="text-gray-400 italic">No messages yet</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* More Options */}
                                        <div
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="relative group/menu">
                                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
                                                    <button
                                                        onClick={() => { }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors duration-200"
                                                    >
                                                        View Profile
                                                    </button>
                                                    <button
                                                        // onClick={() => onBlockUser(chat.user.id)}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors duration-200 flex items-center"
                                                    >
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        {chat.relation_status === 'blocking' ? 'Unblock User' : 'Block User'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
