export type NotificationType =
    | 'notify'
    | 'subscribe'
    | 'unsubscribe'
    | 'message'
    | 'friend_request'
    | 'friend_accept'
    | 'game_invite'
    | 'tournament_started'
    | 'tournament_full'
    | 'match_ready'
    | 'tournament_finished';

export interface IEvent {
    type: NotificationType;
    status?: 'online' | 'offline';
    id?: number;
    subscribers?: number[];
    tournament?: {
        id: number;
        name: string;
    };
    match?: {
        id: number;
        round: number;
        matchNumber: number;
    };
    champion?: {
        id: number;
        username: string;
    };
}

export interface WebSocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    reconnect: () => void;
}
