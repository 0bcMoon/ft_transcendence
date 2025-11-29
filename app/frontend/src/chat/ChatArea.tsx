import React, { RefObject, useEffect, useRef, useState } from 'react'; // Added useState
import { Send, Video, MoreVertical, Menu, MessageSquare, Shield } from 'lucide-react';
import { Contacts, Message } from './types';
import { useActiveChatStore } from '@/state/Store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Modal from './components/Modal'; // ⚠️ REMINDER: You must add dark: classes to Modal.tsx as well!
import { formatTimeToReadable } from '@/component/helper';

// --- Prop Interfaces ---
interface ChatAreaProps {
    onSidebarToggle: () => void;
    ws: RefObject<WebSocket | null>;
}

interface Payload {
    receiver_id: number | undefined,
    content: string,
}

// --- Placeholder Component ---
function StartChatPlaceholder({ onSidebarToggle }: { onSidebarToggle: () => void }) {
    return (
        // ✅ Main background
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">

            {/* ✅ Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200
                            dark:bg-gray-950 dark:border-gray-800">
                <button
                    onClick={onSidebarToggle}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200
                               dark:hover:bg-gray-800"
                >
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="font-semibold text-gray-900 dark:text-gray-100">Messages</h1>
                <div className="w-9" /> {/* Spacer */}
            </div>

            {/* ✅ Centered placeholder content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4
                                  dark:bg-gray-800">
                        <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-gray-100">
                        Welcome to Messages
                    </h2>
                    <p className="text-gray-600 max-w-sm dark:text-gray-400">
                        Select a conversation from the sidebar to start chatting.
                    </p>
                </div>
            </div>
        </div>
    )
}

// --- Main Chat Component ---
export function ChatArea({ onSidebarToggle, ws }: ChatAreaProps) {
    const { active_chat } = useActiveChatStore();
    const [isOpen, setIsOpen] = useState(false); // Changed to useState
    const websocket = ws.current;

    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const is_blocking = active_chat?.relation_status === 'blocking' || active_chat?.relation_status === 'blocked_by';
    const navigate = useNavigate();

    // --- Data Fetching ---
    const { data: messages } = useQuery<Message[]>({
        queryKey: ['messages', active_chat?.id],
        queryFn: async () => {
            const respose = await api.get(`/api/chat/${active_chat?.id}/messages`);
            return respose.data;
        },
        enabled: !!active_chat?.id, // Only run if active_chat exists
    });

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- WebSocket Logic ---
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

    // Form submission handler
    const SendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const message = formData.get("message")?.toString().trim();

        if (!message) return; // Guard clause for empty message

        const newMessage: Payload = {
            content: message,
            receiver_id: active_chat?.id,
        }
        sendMessageMutation.mutate(newMessage);
        event.currentTarget.reset()
    }

    // WebSocket message listener
    useEffect(() => {
        if (!ws.current || !active_chat) return;

        ws.current.onmessage = (event) => {
            const data: Message = JSON.parse(event.data);

            // Update the messages query cache
            queryClient.setQueryData<Message[]>(['messages', active_chat?.id], (oldMessages) => {
                if (!oldMessages) return [data];
                return [...oldMessages, data];
            });

            // Update the contacts list query cache
            queryClient.setQueryData<Contacts[]>(['contacts'], (oldContacts) => {
                if (!oldContacts) return [];

                // Find and update the contact with the new message
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

                // Sort contacts to bring the newest message to the top
                newContacts.sort((a, b) => {
                    const timeA = a.messsage_time ? new Date(a.messsage_time).getTime() : 0;
                    const timeB = b.messsage_time ? new Date(b.messsage_time).getTime() : 0;
                    return timeB - timeA; // Descending order
                });

                return newContacts;
            });
        }
        // Dependency array ensures this effect re-runs if the websocket or active chat changes
    }, [active_chat, ws, queryClient]); // Added ws and queryClient

    // --- Render Logic ---
    if (!active_chat) {
        return (<StartChatPlaceholder onSidebarToggle={onSidebarToggle} />);
    }

    return (
        // ✅ Main container
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                userDisplayName={active_chat.display_name}
                title="User Actions"
            />

            {/* --- Chat Header --- */}
            {/* ✅ Added dark: classes */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200
                            dark:bg-gray-950 dark:border-gray-800">

                <div className="flex items-center">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onSidebarToggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 mr-2
                                   dark:hover:bg-gray-800"
                    >
                        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>

                    {/* User Info */}
                    <div
                        onClick={() => navigate(`/users/${active_chat.id}`)}
                        className="flex items-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors duration-200
                                   dark:hover:bg-gray-800"
                    >
                        <div className="relative">
                            <img
                                src={active_chat.profile_picture}
                                alt={active_chat.display_name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div
                                className={`absolute bottom-0 right-0 w-3 h-3 
                                            rounded-full border-2 border-white 
                                            dark:border-gray-950 {/* ✅ Match header bg */}
                                            ${false ? 'bg-green-500' : 'bg-gray-400'}`} // Status dot logic
                            />
                        </div>
                        <div className="ml-3">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{active_chat.display_name}</h2>
                        </div>
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => toast('TODO: Start a video call')}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200
                                   dark:hover:bg-gray-800"
                    >
                        <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200
                                   dark:hover:bg-gray-800"
                    >
                        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* --- Messages Area --- */}
            {/* ✅ Added dark: bg */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 no-scrollbar
                            dark:bg-gray-900">
                {is_blocking ? (
                    // Blocked State
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            {active_chat.relation_status === 'blocking' ? (
                                <>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-gray-100">
                                        You have blocked this user
                                    </h2>
                                    <p className="text-gray-600 max-w-sm dark:text-gray-400">
                                        You won't be able to send or receive messages.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-gray-100">
                                        You are blocked by this user
                                    </h2>
                                    <p className="text-gray-600 max-w-sm dark:text-gray-400">
                                        You won't be able to send messages.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    // --- Chat Bubbles ---
                    messages?.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                // ✅ Added dark: classes for *received* messages
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.is_own
                                    ? 'bg-blue-600 text-white rounded-br-md' // Sent (already dark-friendly)
                                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700' // Received
                                    }`}
                            >
                                <p className="text-sm leading-relaxed" style={{ wordBreak: 'break-word' }}>{message.content}</p>
                                <p
                                    // ✅ Added dark: class for *received* timestamp
                                    className={`text-xs mt-1 ${message.is_own ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    {formatTimeToReadable(message.created_at)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                {/* Anchor for scrolling to bottom */}
                <div ref={messagesEndRef} />
            </div>

            {/* --- Message Input --- */}
            {!is_blocking && (
                <form onSubmit={SendMessage}>
                    {/* ✅ Added dark: classes for input area */}
                    <div className="p-4 bg-white border-t border-gray-200
                                  dark:bg-gray-950 dark:border-gray-800">
                        <div className="flex items-end space-x-3">
                            <div className="flex-1">
                                <input
                                    name="message"
                                    placeholder="Type a message..."
                                    // ✅ Added dark: classes for input
                                    className="placeholder:text-gray-400 w-full p-3 border border-gray-200 rounded-2xl 
                                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32
                                               dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:border-gray-700"
                                />
                            </div>
                            <button
                                type="submit"
                                // ✅ Added dark: class for disabled state
                                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full 
                                           transition-colors duration-200 disabled:cursor-not-allowed
                                           dark:disabled:bg-gray-700"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form >
            )}
        </div>
    );
}
