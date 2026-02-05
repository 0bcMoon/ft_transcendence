type NotificationType =
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

    message_payload? :{
        username: string;
        content: string;
        profile_piccture: string;
    }

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

