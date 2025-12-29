"use client"

import { useEffect, useRef, useState } from "react"
import { ContactSidebar } from "./ContactSidebar"
import { ChatArea } from "./ChatArea"
import toast from "react-hot-toast"

function Chat() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const WebSocketConnect = () => {

        const websocket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/chat`);

        websocket.onopen = () => {
            if (timeoutRef.current) {
                clearInterval(timeoutRef.current);
                timeoutRef.current = null;
            }
        }

        websocket.onerror = () => {
            toast.error('Connection error.  Please try again later.');
        };

        websocket.onclose = () => {
            if (timeoutRef.current) return;
            ws.current = null;
            timeoutRef.current = setInterval(() => {
                WebSocketConnect();
            }, 5000);
        }
        ws.current = websocket;
    }

    useEffect(() => {
        WebSocketConnect();
        return () => {
            if (ws.current) {
                ws.current.onclose = null;
            }
            ws.current?.close();
        };

    }, [ws.current]);

    return (
        <div className="h-full flex overflow-hidden">
            <ContactSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <ChatArea onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} ws={ws} />
        </div>
    )
}

export default Chat

