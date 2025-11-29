import React from 'react';
import { Contacts } from '../types';
import { useActiveChatStore } from '@/state/Store';
import { formatTimeToReadable } from '@/component/helper';

interface ContactListProps {
    chats: Contacts[];
    onChatSelect: (chat: Contacts) => void;
}

export const ContactList: React.FC<ContactListProps> = ({ chats, onChatSelect }) => {

    const { active_chat } = useActiveChatStore();

    return (
        <div className="p-2">
            {chats.map((chat) => (
                <div
                    key={chat.id}
                    onClick={() => onChatSelect(chat)}
                    className={`relative flex items-center p-4 rounded-lg cursor-pointer 
                                transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 group 
                                ${active_chat?.id === chat.id ? 'bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-400' : ''}`}
                >
                    {/* Avatar */}
                    <div
                        className="relative cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={chat.profile_picture}
                            alt={chat.display_name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800 hover:ring-blue-200 dark:hover:ring-blue-600 transition-all duration-200"
                        />
                        {!(chat.relation_status === 'blocking' || chat.relation_status === 'blocked_by') && (
                            <div
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-950
                                        ${chat.online_status ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}`}
                            />
                        )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 ml-3 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {chat.display_name}
                            </h3>
                            {!(chat.relation_status === 'blocking' || chat.relation_status === 'blocked_by') && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTimeToReadable(chat.messsage_time)}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {(chat.relation_status === 'blocking' || chat.relation_status === 'blocked_by') ? (
                                <span className="text-red-500 dark:text-red-400 italic">User Block </span>
                            ) : (
                                chat.content || <span className="text-gray-400 dark:text-gray-500 italic">No messages yet</span>
                            )}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
