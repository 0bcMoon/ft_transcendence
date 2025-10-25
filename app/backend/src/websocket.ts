import { FastifyInstance } from "fastify";
import { WebSocket } from "@fastify/websocket";
import chatRepository from "./repository/chatRepository";


interface RecvMessage {
    receiver_id: number,
    content: string,
}

const chatConnections: Map<number, WebSocket> = new Map();

export default async function(fastify: FastifyInstance) {
    fastify.get('/chat', { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {
        if (chatConnections.has(req.user.id)) {
            chatConnections.get(req.user.id)?.close();
        }
        chatConnections.set(req.user.id, socket)
        socket.on('message', async (message) => {
            const payload = JSON.parse(message.toString()) as RecvMessage;
            const result = await chatRepository.createMessage(
                req.user.id,
                payload.receiver_id,
                payload.content
            )
            if (!result)
                return;
            const sender_string = JSON.stringify(result);
            result.is_own = false;
            const receiver_string = JSON.stringify(result);
            chatConnections.get(req.user.id)?.send(sender_string);
            chatConnections.get(payload.receiver_id)?.send(receiver_string);

        });

        socket.on('close', () => {
            chatConnections.delete(req.user.id);
        });
    });
};

