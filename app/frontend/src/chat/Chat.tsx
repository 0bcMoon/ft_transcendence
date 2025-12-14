import { useEffect, useRef, useState } from 'react';
import { ContactSidebar } from './ContactSidebar';
import { ChatArea } from './ChatArea';
import toast from 'react-hot-toast';

function Chat() {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isWsConnected, setIsWsConnected] = useState(false);

    console.log('WebSocket URL:', `${import.meta.env.VITE_WS_URL}/ws/chat`);

    useEffect(() => {

        toast.success('Attempting to connect to WebSocket...');
        if (ws.current) {
            return;
        }
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
            toast.error('Connection error. Please try again later.');
        };

        websocket.onclose = () => {
            ws.current = null;
            timeoutRef.current = setInterval(() => {
                setIsWsConnected((prev) => !prev);
            }, 5000);

            toast.error('Disconnected from chat server.');
        }
        ws.current = websocket;
        return () => {
            websocket.close();
        };

    }, [isWsConnected]);

    // TODO: fix sidebar color unmatch 

    return (
        <div className="h-full bg-gray-100 flex overflow-hidden">
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
