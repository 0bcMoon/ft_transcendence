import { FastifyInstance } from "fastify";
import { WebSocket } from "@fastify/websocket";

const online = new Map<number, WebSocket>();

type NotificationType = 'heartbeat' | 'message' | 'friend_request' | 'friend_accept' | 'game_invite';

export interface IEvent {
    type: NotificationType;
    content: string | number;
}

export default async function(fastify: FastifyInstance) {
    fastify.get('/notify', { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {
        fastify.log.info(`User ${req.user.id} connected to notifications`);
        if (online.has(req.user.id)) {
            online.get(req.user.id)?.close();
        }

        online.set(req.user.id, socket)

        online.set(req.user.id, socket);
        socket.on('close', () => {
            fastify.log.info(`User ${req.user.id} disconnect to notifications`);
            online.delete(req.user.id);
            fastify.log.info(`User count ${online.size} `);
        });

        socket.on('message', async (message) => {
            const payload = JSON.parse(message.toString()) as IEvent;
            switch (payload.type) {
                case 'heartbeat': // heartbeat message
                    socket.send(Heartbeat(payload.content as number));
                    break;
            }

        });

    });
};

// TODO: add redis to store last online status

function Heartbeat(user_id: number) {
    const event: IEvent = {
        type: 'heartbeat',
        content: 'offline'
    };

    const socket = online.get(user_id);
    if (socket) {
        event.content = 'online';
    }
    return JSON.stringify(event);
}
