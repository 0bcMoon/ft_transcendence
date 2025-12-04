import { FastifyInstance } from "fastify";
import { WebSocket } from "@fastify/websocket";
import fastify from "./app";

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

type NotificationType = 'notify' | 'subscribe' | 'unsubscribe' | 'message' | 'friend_request' | 'friend_accept' | 'game_invite';

export interface IEvent {
    type: NotificationType;
    status?: 'online' | 'offline';
    id?: number; // user id for status change
    subscribers?: number[];
}

export function notify(userId: number, event: string) {
    const subs = subscribers.get(userId);
    if (!subs) return fastify.log.warn(`No subscribers for user ${userId}`);
    subs.forEach(subId => online.get(subId)?.send(event));
}

export default async function(fastify: FastifyInstance) {
    fastify.get('/notify', { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {
        fastify.log.info(`User ${req.user.id} connected to notifications`);
        if (online.has(req.user.id)) {
            online.get(req.user.id)?.close();
        }
        online.set(req.user.id, socket)
        notify(req.user.id, JSON.stringify({ type: 'notify', status: true, id: req.user.id })); // notify subscribers that user is online
        socket.on('close', () => {
            notify(req.user.id, JSON.stringify({ type: 'notify', status: false, id: req.user.id })); // notify subscribers that user is offline
            fastify.log.info(`User ${req.user.id} disconnect to notifications`);
            online.delete(req.user.id);
            fastify.log.info(`User count ${online.size} `);
        });

        socket.on('message', async (message) => {
            const payload = JSON.parse(message.toString()) as IEvent;
            switch (payload.type) {
                case 'subscribe': // heartbeat message
                    fastify.log.info(`User ${req.user.id} subscribe to ${payload.subscribers}`);
                    subscribe(req.user.id, payload.subscribers || []);
                    break;
                case 'unsubscribe': // heartbeat message
                    unsubscribe(req.user.id, payload.subscribers || []);
                    break;
            }

        });

    });
};

