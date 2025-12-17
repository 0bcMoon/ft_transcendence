import { useEffect, useRef, useState } from 'react';
import { ContactSidebar } from './ContactSidebar';
import { ChatArea } from './ChatArea';
import toast from 'react-hot-toast';

function Chat() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const WebSocketConnect = () => {
        toast.success('Attempting to connect to WebSocket...');
        const websocket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/chat`);

        websocket.onopen = () => {
            if (timeoutRef.current) {
                toast.success('Reconnected to chat server.');
                clearInterval(timeoutRef.current);
                timeoutRef.current = null;
            }
            toast.success('Connected to chat server.');
        }

        websocket.onerror = () => {
            toast.error('Connection error.  Please try again later.');
        };

        websocket.onclose = () => {
            if (timeoutRef.current) return;
            ws.current = null;
            timeoutRef.current = setInterval(() => {
                WebSocketConnect();
                toast.loading('Attempting to reconnect to chat server...');
            }, 5000);
            toast.error(`Disconnected from chat server. ${timeoutRef.current}`);
        }
        ws.current = websocket;
    }

    useEffect(() => {
        WebSocketConnect();
        return () => {
            ws.current?.close();
        };

    }, [ws.current]);

    return (
        <div className="h-full bg-gray-50 dark:bg-slate-950 flex overflow-hidden">
            {/* Contact Sidebar */}
            <ContactSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Chat Area */}
            <ChatArea
                onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                ws={ws}
            />
        </div>
    );
}

export default Chat;
