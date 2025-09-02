import { useState, useEffect } from 'react';
import { Chat, User, Message, ChatRequest } from './types';

export const useChatData = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);

    useEffect(() => {
        // Mock data - in a real app this would come from an API
        const mockUsers: User[] = [
            {
                id: '1',
                name: 'Alice Johnson',
                avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
                isOnline: true,
                lastSeen: '2 min ago',
                isBlocked: false,
            },
            {
                id: '2',
                name: 'Bob Smith',
                avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
                isOnline: false,
                lastSeen: '1 hour ago',
                isBlocked: false,
            },
            {
                id: '3',
                name: 'Emma Wilson',
                avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
                isOnline: true,
                lastSeen: 'Just now',
                isBlocked: false,
            },
            {
                id: '4',
                name: 'David Chen',
                avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150',
                isOnline: false,
                lastSeen: '3 hours ago',
                isBlocked: true,
            },
            {
                id: '5',
                name: 'Sarah Davis',
                avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150',
                isOnline: true,
                lastSeen: 'Active now',
                isBlocked: false,
            },
        ];

        const mockChatRequests: ChatRequest[] = [
            {
                id: 'req1',
                user: {
                    id: '6',
                    name: 'Michael Brown',
                    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
                    isOnline: true,
                    lastSeen: 'Active now',
                    isBlocked: false,
                },
                message: 'Hi! I saw your profile and would love to connect. I think we have some mutual interests!',
                timestamp: '5 min ago',
            },
            {
                id: 'req2',
                user: {
                    id: '7',
                    name: 'Lisa Garcia',
                    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
                    isOnline: false,
                    lastSeen: '30 min ago',
                    isBlocked: false,
                },
                message: 'Hello! I\'m working on a similar project and would like to discuss some ideas.',
                timestamp: '1 hour ago',
            },
        ];
        const mockMessages: { [chatId: string]: Message[] } = {
            '1': [
                {
                    id: '1',
                    senderId: '1',
                    content: 'Hey! How are you doing today?',
                    timestamp: '10:30 AM',
                    isOwn: false,
                },
                {
                    id: '2',
                    senderId: 'me',
                    content: 'I\'m doing great! Just working on some new projects. How about you?',
                    timestamp: '10:32 AM',
                    isOwn: true,
                },
                {
                    id: '3',
                    senderId: '1',
                    content: 'That sounds exciting! I\'d love to hear more about it sometime.',
                    timestamp: '10:35 AM',
                    isOwn: false,
                },
            ],
            '2': [
                {
                    id: '4',
                    senderId: '2',
                    content: 'Did you see the latest update on the project?',
                    timestamp: '9:15 AM',
                    isOwn: false,
                },
                {
                    id: '5',
                    senderId: 'me',
                    content: 'Yes, looks really promising! Great work on the new features.',
                    timestamp: '9:20 AM',
                    isOwn: true,
                },
            ],
            '3': [
                {
                    id: '6',
                    senderId: 'me',
                    content: 'Thanks for your help with the presentation today!',
                    timestamp: '2:45 PM',
                    isOwn: true,
                },
                {
                    id: '7',
                    senderId: '3',
                    content: 'You\'re welcome! It went really well, I think.',
                    timestamp: '2:47 PM',
                    isOwn: false,
                },
            ],
            '4': [],
            '5': [
                {
                    id: '8',
                    senderId: '5',
                    content: 'Are we still on for coffee tomorrow?',
                    timestamp: '4:20 PM',
                    isOwn: false,
                },
            ],
        };

        const mockChats: Chat[] = mockUsers.map(user => {
            const messages = mockMessages[user.id] || [];
            return {
                id: user.id,
                user,
                messages,
                lastMessage: messages[messages.length - 1],
            };
        });

        setChats(mockChats);
        setChatRequests(mockChatRequests);
    }, []);

    const acceptChatRequest = (requestId: string) => {
        const request = chatRequests.find(req => req.id === requestId);
        if (request) {
            // Add to chats
            const newChat: Chat = {
                id: request.user.id,
                user: request.user,
                messages: [
                    {
                        id: `msg_${Date.now()}`,
                        senderId: request.user.id,
                        content: request.message,
                        timestamp: request.timestamp,
                        isOwn: false,
                    },
                ],
                lastMessage: {
                    id: `msg_${Date.now()}`,
                    senderId: request.user.id,
                    content: request.message,
                    timestamp: request.timestamp,
                    isOwn: false,
                },
            };

            setChats(prevChats => [newChat, ...prevChats]);
            setChatRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
        }
    };

    const denyChatRequest = (requestId: string) => {
        setChatRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
    };
    const blockUser = (userId: string) => {
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.user.id === userId
                    ? { ...chat, user: { ...chat.user, isBlocked: !chat.user.isBlocked } }
                    : chat
            )
        );

        if (activeChat?.user.id === userId) {
            setActiveChat(prevChat =>
                prevChat
                    ? { ...prevChat, user: { ...prevChat.user, isBlocked: !prevChat.user.isBlocked } }
                    : null
            );
        }
    };

    return {
        chats,
        activeChat,
        setActiveChat,
        blockUser,
        chatRequests,
        acceptChatRequest,
        denyChatRequest,
    };
};
