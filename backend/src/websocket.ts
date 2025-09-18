import { FastifyInstance } from "fastify";
import { WebSocket } from "@fastify/websocket";
import { messageRepository } from "./repository/messageRespository";


interface RecvMessage {
    receiver_id: number,
    content: string,
}

// const connections : Map<number, WebSocketConnection> = new Map();
const chatConnections: Map<number, WebSocket> = new Map();

export default async function(fastify: FastifyInstance) {
    fastify.get('/chat', { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {
        // Check if the user already has an active connection kill it
        // This is to ensure that a user can only have one active WebSocket connection at a
        if (chatConnections.has(req.user.id)) {
            chatConnections.get(req.user.id)?.close();
        }
        // Add the new connection to the set
        chatConnections.set(req.user.id, socket)
        socket.on('message', async (message) => {
            const recvMessage = JSON.parse(message.toString()) as RecvMessage;
            const result = await messageRepository.createMessage(
                req.user.id,
                recvMessage.receiver_id,
                recvMessage.content
            )
            if (!result)
                return;
            const resultString = JSON.stringify(result);
            chatConnections.get(req.user.id)?.send(resultString);
            chatConnections.get(result.receiver_id)?.send(resultString);

        });

        socket.on('close', () => {
            chatConnections.delete(req.user.id);
        });
    });
};

