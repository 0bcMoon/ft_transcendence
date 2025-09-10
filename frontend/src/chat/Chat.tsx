import { useEffect, useRef, useState } from 'react';
import { ContactSidebar } from './ContactSidebar';
import { ChatArea } from './ChatArea';
import toast from 'react-hot-toast';

function Chat() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const websocket = new WebSocket(`${import.meta.env.VITE_WS_URL}/chat`);
        websocket.onerror = () => {
            toast.error('Connection error. Please try again later.');
        };
        ws.current = websocket;
        return () => {
            websocket.close();
        };
    }, []);

    return (
        <div className="h-[97svh] bg-gray-100 flex overflow-hidden col-span-14 border-gray-100 border-2 shadow-lg shadow-gray-200 rounded-2xl">
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
