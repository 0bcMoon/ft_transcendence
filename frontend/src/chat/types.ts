export interface User {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen: string;
    isBlocked: boolean;
}

export interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_own: boolean;
}

export interface Contacts {
        id: number
        display_name: string
        profile_picture: string
        image_src?: string
        relation_status: string
        content: string | null
        messsage_time: string | null
}

export interface ChatRequest {
    id: string;
    user: User;
    message: string;
    timestamp: string;
}
