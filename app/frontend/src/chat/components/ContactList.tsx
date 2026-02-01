import type { Contacts } from "../types"
import { useActiveChatStore } from "@/state/Store"
import { formatTimeToReadable } from "@/component/helper"

interface ContactListProps {
    chats: Contacts[]
    onChatSelect: (chat: Contacts) => void
}

export function ContactList({ chats, onChatSelect }: ContactListProps) {
    const { active_chat } = useActiveChatStore()

    return (
        <div className="p-2 space-y-1">
            {chats.map((chat) => (
                <div
                    key={chat.id}
                    onClick={() => onChatSelect(chat)}
                    className={`relative flex items-center p-4 rounded-lg cursor-pointer 
                      transition-all duration-200 hover:bg-slate-800 group 
                      ${active_chat?.id === chat.id
                            ? "bg-slate-800 border-l-4 border-blue-500"
                            : "border-l-4 border-transparent"
                        }`}
                >
                    {/* Avatar */}
                    <div className="relative cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={chat.profile_picture || "/placeholder.svg"}
                            alt={"img"}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700 hover:ring-blue-500 transition-all duration-200"
                        />
                        {!(chat.relation_status === "blocking" || chat.relation_status === "blocked_by") && (
                            <div
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950
                            ${chat.online_status ? "bg-green-500" : "bg-slate-600"}`}
                            />
                        )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 ml-3 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white truncate">{chat.display_name}</h3>
                            {!(chat.relation_status === "blocking" || chat.relation_status === "blocked_by") && (
                                <span className="text-xs text-slate-400">{formatTimeToReadable(chat.messsage_time)}</span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 truncate mt-1">
                            {chat.relation_status === "blocking" || chat.relation_status === "blocked_by" ? (
                                <span className="text-red-400 italic">User Blocked</span>
                            ) : chat.content ? (
                                chat.content
                            ) : (
                                <span className="text-slate-500 italic">No messages yet</span>
                            )}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

