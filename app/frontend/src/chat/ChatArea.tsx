import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Send, MoreVertical, Menu, MessageSquare, Shield } from 'lucide-react';
import { Contacts, Message } from './types';
import { useActiveChatStore } from '@/state/Store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Modal from './components/Modal';
import { formatTimeToReadable } from '@/component/helper';

interface ChatAreaProps {
    onSidebarToggle: () => void;
    ws: RefObject<WebSocket | null>;
}

interface Payload {
    receiver_id: number | undefined,
    content: string,
}

function StartChatPlaceholder({ onSidebarToggle }: { onSidebarToggle: () => void }) {
    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-900">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
                <button
                    onClick={onSidebarToggle}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-900 transition-colors"
                >
                    <Menu className="w-5 h-5 text-gray-700 dark:text-slate-400" />
                </button>
                <h1 className="font-semibold text-gray-900 dark:text-white">Messages</h1>
                <div className="w-9" />
            </div>

            {/* Centered placeholder */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-12 h-12 text-gray-400 dark:text-slate-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Welcome to Messages
                    </h2>
                    <p className="text-gray-600 dark:text-slate-400 max-w-sm">
                        Select a conversation from the sidebar to start chatting.
                    </p>
                </div>
            </div>
        </div>
    )
}

export function ChatArea({ onSidebarToggle, ws }: ChatAreaProps) {
    const { active_chat } = useActiveChatStore();
    const [isOpen, setIsOpen] = useState(false);
    const websocket = ws.current;

    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const is_blocking = active_chat?.relation_status === 'blocking' || active_chat?.relation_status === 'blocked_by';
    const navigate = useNavigate();

    const { data: messages } = useQuery<Message[]>({
        queryKey: ['messages', active_chat?.id],
        queryFn: async () => {
            const respose = await api.get(`/api/chat/${active_chat?.id}/messages`);
            return respose.data;
        },
        enabled: !!active_chat?.id,
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const postMessage = async (payload: Payload) => {
        if (websocket === null || websocket?.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }
        websocket?.send(JSON.stringify(payload));
    };

    const sendMessageMutation = useMutation({
        mutationFn: postMessage,
        onError: (error) => {
            toast.error('Failed to send message: ' + error.message);
        },
    });

    const SendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const message = formData.get("message")?.toString().trim();

        if (!message) return;

        const newMessage: Payload = {
            content: message,
            receiver_id: active_chat?.id,
        }
        sendMessageMutation.mutate(newMessage);
        event.currentTarget.reset()
    }

    useEffect(() => {
        if (!ws.current || !active_chat) return;

        ws.current.onmessage = (event) => {
            const data: Message = JSON.parse(event.data);

            queryClient.setQueryData<Message[]>(['messages', active_chat?.id], (oldMessages) => {
                if (!oldMessages) return [data];
                return [...oldMessages, data];
            });

            queryClient.setQueryData<Contacts[]>(['contacts'], (oldContacts) => {
                if (!oldContacts) return [];

                const newContacts = oldContacts.map(contact => {
                    if (contact.id === data.sender_id || contact.id === active_chat?.id) {
                        return {
                            ...contact,
                            content: data.content,
                            messsage_time: data.created_at,
                        };
                    }
                    return contact;
                });

                newContacts.sort((a, b) => {
                    const timeA = a.messsage_time ? new Date(a.messsage_time).getTime() : 0;
                    const timeB = b.messsage_time ? new Date(b.messsage_time).getTime() : 0;
                    return timeB - timeA;
                });

                return newContacts;
            });
        }
    }, [active_chat, ws, queryClient]);

    if (!active_chat) {
        return (<StartChatPlaceholder onSidebarToggle={onSidebarToggle} />);
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-900 overflow-hidden">
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                userDisplayName={active_chat.display_name}
                title="User Actions"
            />

            {/* Chat Header - DARK style with light mode support */}
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center">
                    <button
                        onClick={onSidebarToggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-900 transition-colors mr-2"
                    >
                        <Menu className="w-5 h-5 text-gray-700 dark:text-slate-400" />
                    </button>

                    <div
                        onClick={() => navigate(`/users/${active_chat.id}`)}
                        className="flex items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-900 rounded-lg p-2 -ml-2 transition-colors"
                    >
                        <div className="relative">
                            <img
                                src={active_chat.profile_picture}
                                alt={active_chat.display_name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-100 dark:border-slate-950
                                            ${false ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'}`}
                            />
                        </div>
                        <div className="ml-3">
                            <h2 className="font-semibold text-gray-900 dark:text-white">{active_chat.display_name}</h2>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-900 transition-colors"
                    >
                        <MoreVertical className="w-5 h-5 text-gray-700 dark:text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Messages Area - LIGHTER */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900 no-scrollbar">
                {is_blocking ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Shield className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-3" />
                            {active_chat.relation_status === 'blocking' ? (
                                <>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        You have blocked this user
                                    </h2>
                                    <p className="text-gray-600 dark:text-slate-400 max-w-sm">
                                        You won't be able to send or receive messages.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        You are blocked by this user
                                    </h2>
                                    <p className="text-gray-600 dark:text-slate-400 max-w-sm">
                                        You won't be able to send messages.
                                    </p>
                                </>
                            )}
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
                                    ? 'bg-blue-600 text-white rounded-br-md'
                                    : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-slate-700'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed" style={{ wordBreak: 'break-word' }}>{message.content}</p>
                                <p className={`text-xs mt-1 ${message.is_own ? 'text-blue-100' : 'text-gray-500 dark:text-slate-400'}`}>
                                    {formatTimeToReadable(message.created_at)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input - WHITE/LIGHT */}
            {!is_blocking && (
                <form onSubmit={SendMessage}>
                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex items-end space-x-3">
                            <div className="flex-1">
                                <input
                                    name="message"
                                    placeholder="Type a message..."
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl 
                                               text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500
                                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full 
                                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
