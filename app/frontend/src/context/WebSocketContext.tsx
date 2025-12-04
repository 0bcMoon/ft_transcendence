import { createContext, useEffect, ReactNode, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { IEvent } from '@/home/Notification';
import { useQueryClient } from '@tanstack/react-query';


interface WebSocketContextType {
    socket: WebSocket | null;
    setSocket: (socket: WebSocket | null) => void;
}



const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {

    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { isAuthenticated, isLoading } = useAuth();
    const queryClient = useQueryClient();

    ///------------------------------------------------------h do not touch
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
    ///------------------------------------------------------h
    /* called from a component that registers a callback for a channel */

    useEffect(() => {
        // toast.success('WebSocketProvider mounted');
        if (isLoading || !isAuthenticated) return; // wait until auth is resolved
        else if (socket && socket.readyState === WebSocket.OPEN) return; // already initialized
        /* WS initialization and cleanup */
        const ws = new WebSocket('ws://localhost:3000/ws/notify');
        ws.onopen = () => {
            // toast.success('WebSocket connected')
        }
        ws.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data) as IEvent;
            console.log('WebSocket message received:', data);
            // Handle different types of messages
            switch (data.type) {
                case 'notify':
                    toast.success("User become online");
                    changeUserStatus(data);
                    break;
                default:
                    console.warn('Unknown message type:', data.type);
            }
        }
            ;
        ws.onclose = () => {
            // toast.error('WebSocket disconnected')
        }
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            // toast.error('WebSocket error')
        }
        setSocket(ws);
        return () => {
            ws?.close()
            setSocket(null);
        }
    }, [isLoading, isAuthenticated]);

    return (
        <WebSocketContext.Provider value={{
            socket: socket,
            setSocket: setSocket,
        }}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocket = () => {

    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}
