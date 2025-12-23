"use client"

import { useEffect, useRef, useState } from "react"
import { ContactSidebar } from "./ContactSidebar"
import { ChatArea } from "./ChatArea"
import toast from "react-hot-toast"

function Chat() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const ws = useRef<WebSocket | null>(null)

    useEffect(() => {
        const websocket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/chat`)
        websocket.onerror = () => {
            toast.error("Connection error. Please try again later.")
        }
        ws.current = websocket
        return () => {
            websocket.close()
        }
    }, [])

    return (
        <div className="h-full flex overflow-hidden">
            <ContactSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <ChatArea onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} ws={ws} />
        </div>
    )
}

export default Chat

