export interface Notifications {
    id: number;
    user_id: number;
    title: string;
    message: string;
    link?: string | null;
    is_read: boolean;
    created_at: string;
}

export interface MessagePayload {
    username: string;
    content: string;
    profile_picture: string;
}

export interface Tournament {
    id: number;
    name: string;
}


export interface IEvent {
    type:
    | 'user_status'
    | 'message'
    | 'notification'
    | 'game_invite';

    notification: Notification;

    sender?: {
        username: string;
        profile_picture: string;
    };

    userId?: number;
    status?: 'online' | 'offline';
    message?: MessagePayload;
    tournament?: Tournament;
}

export interface WebSocketContextType {
    socket: WebSocket | null;
    setSocket: (socket: WebSocket | null) => void;
}

//-------------------------------------------------------------

export interface Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    is_read: boolean;
    created_at: string;
}
