import { FastifyInstance } from "fastify";
import { Notification } from "./repository/notificationsRepository";
import WebSocket from "ws";
import fastify from "./app";
import { userRepository } from "./repository/userRepository";

type NotificationType =
    | 'user_status'        
    | 'subscribe'          
    | 'unsubscribe'        
    | 'message'            
    | 'notification';      

export interface IEvent {
    type: NotificationType;
    userId?: number;
    status?: 'online' | 'offline';
    notification?: Notification;
    sender?: {
        username: string;
        profile_picture: string;
    };
    message?: {
        username: string;
        content: string;
        profile_picture: string;
    };
    subscribers?: number[];
}

const online = new Map<number, WebSocket>();

const subscribers = new Map<number, Set<number>>();

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


export function notifyUsers(userIds: number[], event: IEvent) {
    userIds.forEach(userId => {
        notifyUser(userId, event);
    });
    fastify.log.info(`Broadcast ${event.type} to ${userIds.length} users`);
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

        // TODO: remove this
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
