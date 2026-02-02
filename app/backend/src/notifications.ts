import { FastifyInstance } from "fastify";
import WebSocket from "ws";

import fastify from "./app";
import { userRepository } from "./repository/userRepository";

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

    message_payload?: {
        username: string;
        content: string;
        profile_picture: string;
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

const online = new Map<number, WebSocket>();

const subscribers = new Map<number, Set<number>>(); // userId -> Set of subscriberIds

export function isOnline(userId: number) {
    return online.has(userId);
}

export function subscribe(userId: number, subscriberId: number[]) {
    fastify.log.debug(`User ${userId} subscribing to ${subscriberId}`);
    subscriberId.forEach(subId => {
        if (!subscribers.has(subId)) subscribers.set(subId, new Set());
        subscribers.get(subId)?.add(userId);
    });
}

export function unsubscribe(userId: number, subscriberId: number[]) {
    fastify.log.debug(`User ${userId} Unsubscribing to ${subscriberId}`);
    subscriberId.forEach(subId => {
        subscribers.get(subId)?.delete(userId);
        if (subscribers.get(subId)?.size === 0) subscribers.delete(subId);
    });
}


export function notify(userId: number, event: string) {
    const subs = subscribers.get(userId);
    if (!subs) return fastify.log.warn(`No subscribers for user ${userId}`);
    subs.forEach(subId => online.get(subId)?.send(event));
}

export function notifyUser(userId: number, event: IEvent) {
    const connection = online.get(userId);
    if (!connection) {
        fastify.log.warn(`User ${userId} has no connection stored`);
        return;
    }

    if (connection.readyState !== WebSocket.OPEN) {
        fastify.log.warn(`User ${userId} socket not OPEN (state: ${connection.readyState})`);
        return;
    }

    connection.send(JSON.stringify(event));
    fastify.log.info(`Sent ${event.type} to user ${userId}`);
}


// Send notification to multiple users
export function notifyUsers(userIds: number[], event: IEvent) {
    userIds.forEach(userId => {
        notifyUser(userId, event);
    });
    fastify.log.info(`Broadcast ${event.type} to ${userIds.length} users`);
}

// Send notification to all online users
export function broadcastToAll(event: IEvent) {
    let sentCount = 0;
    online.forEach((socket, userId) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(event));
            sentCount++;
        }
    });
    fastify.log.info(`Broadcast ${event.type} to ${sentCount} online users`);
}
export function sendPayload(userId: number, payload: IEvent) {
    const connection = online.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(payload));
        fastify.log.info(`Sent message to user ${userId}`);
    } else {
        fastify.log.warn(`User ${userId} is not online`);
    }
}

export default async function(fastify: FastifyInstance) {
    fastify.get('/notify', { websocket: true, onRequest: fastify.authenticate }, async (socket, req) => {
        if (online.has(req.user.id)) {
            online.get(req.user.id)?.close();
        }
        online.set(req.user.id, socket)
        const contactIds = (await userRepository.getContactList(req.user.id)).map(c => c.id);
        const friendIds = (await userRepository.getFriends(req.user.id)).map(f => f.id);

        fastify.log.info(`User ${req.user.id} connected to notifications`);
        fastify.log.info(`User count ${online.size} `);
        fastify.log.debug(`User ${req.user.id} subscribing to contacts: ${contactIds}`);
        fastify.log.debug(`User ${req.user.id} subscribing to friends: ${friendIds}`);

        subscribe(req.user.id, [...contactIds, ...friendIds]); // auto
        notify(req.user.id, JSON.stringify({ type: 'notify', status: true, id: req.user.id })); // notify subscribers that user is online
        socket.on('close', () => {
            notify(req.user.id, JSON.stringify({ type: 'notify', status: false, id: req.user.id })); // notify subscribers that user is offline
            fastify.log.info(`User ${req.user.id} disconnect to notifications`);
            unsubscribe(req.user.id, [...contactIds, ...friendIds]);
            online.delete(req.user.id);
        });

        socket.on('message', async (message) => {
            try {
                const payload = JSON.parse(message.toString()) as IEvent;
                switch (payload.type) {
                    case 'unsubscribe': // heartbeat message
                        unsubscribe(req.user.id, payload.subscribers || []);
                        break;
                    default:
                        fastify.log.warn(`Unknown notification type: ${payload.type} from user ${req.user.id}`);
                        break;
                }
            } catch (error) {
                fastify.log.error(`Error processing message from user ${req.user.id}: ${error}`);
            }
        });

    });
};

