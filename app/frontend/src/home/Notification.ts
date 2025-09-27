type NotificationType = 'heartbeat' | 'message' | 'friend_request' | 'friend_accept' | 'game_invite';

export interface IEvent {
    type: NotificationType;
    content: string | number;
}



