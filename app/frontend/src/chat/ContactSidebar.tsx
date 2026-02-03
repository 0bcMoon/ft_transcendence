import { useState } from "react"
import { Search, MessageSquare } from "lucide-react"
import { ContactList } from "./components/ContactList"
import { useActiveChatStore } from "@/state/Store"
import { useContacts } from "./hooks/query"

interface ContactSidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function ContactSidebar({ isOpen, onClose }: ContactSidebarProps) {

    const setActiveChat = useActiveChatStore((state) => state.setActiveChat)
    const { data: chats, isLoading } = useContacts()

    const [searchTerm, setSearchTerm] = useState("")

    const handleChatSelect = (chat: any) => {
        setActiveChat(chat)
        onClose()
    }

    const filteredChats =
        chats?.filter((chat) => chat.display_name.toLowerCase().includes(searchTerm.toLowerCase())) || []

    if (isLoading) {
        return (
            <div className="w-full lg:w-96 bg-slate-950 border-r border-slate-800 flex items-center justify-center">
                <p className="text-slate-400">Loading...</p>
            </div>
        )
    }

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed top-16 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}

            <div
                className={`fixed lg:relative top-16 lg:top-auto bottom-0 lg:bottom-auto left-0 z-50 
                            h-[calc(100vh-4rem)] lg:h-full w-full lg:w-96 bg-slate-950 border-r 
                            border-slate-800 transform transition-transform duration-300
                            ease-in-out lg:transform-none 
                            ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-white">Messages</h1>
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg 
                                           text-white placeholder:text-slate-500 
                                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Contact List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredChats?.length === 0 ? (
                            <div className="p-6 text-center">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                                <p className="text-slate-400">No conversations found</p>
                            </div>
                        ) : (
                            <ContactList chats={filteredChats} onChatSelect={handleChatSelect} />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

