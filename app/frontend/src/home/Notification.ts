type NotificationType = 'notify' | 'subscribe' | 'unsubscribe' | 'message' | 'friend_request' | 'friend_accept' | 'game_invite';

export interface IEvent {
    type: NotificationType;
    status?: 'online' | 'offline';
    id?: number;
    subscribers?: number[];
}

export function subscribe(socket: WebSocket, subscribers: number[]) {
    const message: IEvent = {
        type: 'subscribe',
        subscribers: subscribers
    };
    socket.send(JSON.stringify(message));
}

export function unsubscribe(socket: WebSocket, subscribers: number[]) {
    const message: IEvent = {
        type: 'unsubscribe',
        subscribers: subscribers
    };
    socket.send(JSON.stringify(message));
}


