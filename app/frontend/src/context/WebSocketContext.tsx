// context/WebSocketContext.tsx

import { createContext, useEffect, ReactNode, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { IEvent } from '@/home/Notification';
import { useQueryClient } from '@tanstack/react-query';
import {
    TournamentFullToast,
    MatchReadyToast,
    TournamentFinishedToast,
} from '@/notifications/components/TournamentNotifications';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WebSocketContextType {
    socket: WebSocket | null;
    setSocket: (socket: WebSocket | null) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface IMessageNotification {
    username?: string;
    content?: string;
    profile_picture?: string;
    onClose: () => void;
}

const MessageNotification = ({ username, content, profile_picture, onClose }: IMessageNotification) => {

    const navigate = useNavigate();

    return (
        <div onClick={() => navigate("/chat")}
            className="flex items-center bg-gray-800 rounded-lg shadow-sm p-4 w-80">
            {/* Profile Picture */}
            <img
                src={profile_picture}
                alt={username}
                className="w-12 h-12 rounded-full object-cover mr-4"
            />

            {/* Content */}
            <div className="flex-1">
                <h3 className="font-semibold text-white">{username}</h3>
                <p className="text-white">{content}</p>
            </div>

            <button onClick={(e) => { e.stopPropagation(); onClose() }} className="ml-4 text-blue-600 font-medium hover:text-blue-800 focus:outline-none">
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

export default MessageNotification;
export function WebSocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { isAuthenticated, isLoading } = useAuth();
    const queryClient = useQueryClient();

    //-------------------------DO NOT TOUCH-------------------------//
    function changeUserStatus(data: IEvent) {
        queryClient.setQueryData(['contacts'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((contact: any) => {
                if (contact.id === data.id) {
                    return { ...contact, online_status: data.status };
                }
                return contact;
            });
        });

        queryClient.setQueryData(['friends'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((contact: any) => {
                if (contact.id === data.id) {
                    return { ...contact, online_status: data.status };
                }
                return contact;
            });
        });
    }

    // Invalidate tournament queries
    function invalidateTournamentQueries(tournamentId?: number) {
        if (tournamentId) {
            queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
            queryClient.invalidateQueries({ queryKey: ['tournament-bracket', tournamentId] });
            queryClient.invalidateQueries({ queryKey: ['tournament-players', tournamentId] });
        }
        queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    }

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;
        if (socket && socket.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/notify`);

        // ws.onopen = () => {
        //     toast.success('[WebSocket] Connected 🎉');
        // };

        ws.onmessage = (event: MessageEvent) => {
            try {

                const data = JSON.parse(event.data) as IEvent;
                console.log('[WebSocket] 📨', data.type);

                switch (data.type) {
                    case 'notify':
                        if (data.status === 'online') {
                            toast.success('User became online', { duration: 3000 });
                        }
                        changeUserStatus(data);
                        break;

                    case 'tournament_full':
                        if (data.tournament) {
                            toast.custom(
                                (t) => (
                                    <TournamentFullToast
                                        tournament={data.tournament!}
                                        onClose={() => toast.dismiss(t.id)}
                                    />
                                ),
                                { duration: 5000, position: 'top-right' }
                            );
                            invalidateTournamentQueries(data.tournament.id);
                        }
                        break;

                    case 'match_ready':
                        if (data.tournament && data.match) {
                            toast.custom(
                                (t) => (
                                    <MatchReadyToast
                                        tournament={data.tournament!}
                                        match={data.match!}
                                        onClose={() => toast.dismiss(t.id)} />
                                ),
                                { duration: 150000, position: 'top-center' }
                            );
                            invalidateTournamentQueries(data.tournament.id);
                        }
                        break;

                    case 'tournament_finished':
                        if (data.tournament && data.champion) {
                            toast.custom(
                                (t) => (
                                    <TournamentFinishedToast
                                        tournament={data.tournament!}
                                        champion={data.champion!}
                                        onClose={() => toast.dismiss(t.id)}
                                    />
                                ),
                                { duration: 12000, position: 'top-right' }
                            );
                            invalidateTournamentQueries(data.tournament.id);
                        }
                        break;

                    case 'message':
                        console.log('Message payload:', data.message_payload);
                        toast.custom(
                            (t) => (
                                <MessageNotification
                                    {...data.message_payload}
                                    onClose={() => toast.dismiss(t.id)}
                                />
                            ),
                            { duration: 5000, position: 'top-right' }
                        );
                        break;
                    default:
                        console.warn('[WebSocket] Unknown type:', data.type);
                }
            } catch (error) {
                console.error('[WebSocket] Parse error:', error);
            }
        };

        ws.onclose = () => {
            console.log('[WebSocket] Disconnected');
        };

        ws.onerror = (error) => {
            console.error('[WebSocket]  Error:', error);
        };

        setSocket(ws);

        return () => {
            ws?.close();
            setSocket(null);
        };
    }, [isLoading, isAuthenticated, queryClient]);

    return (
        <WebSocketContext.Provider value={{ socket, setSocket }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
