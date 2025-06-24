import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { WebSocket } from "@fastify/websocket";
import { messageRepository } from "./repository/messageRespository";
import fastify from "./app";

interface WebSocketConnection {
    socket: WebSocket;
}

interface RecvMessage {
    receiver_id: number,
    content: string,
}

// const connections : Map<number, WebSocketConnection> = new Map();
const chatConnections: Map<number, WebSocket> = new Map();

export default async function(fastify: FastifyInstance) {
    fastify.get('/chat', { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {
        // Add the new connection to the set
        chatConnections.set(req.user.id, socket)
        socket.on('message', async (message) => {
            const recvMessage = JSON.parse(message.toString()) as RecvMessage;
            const result = await messageRepository.createMessage(
                req.user.id, // Assuming req.user.id is the sender's ID
                recvMessage.receiver_id, // The receiver's ID from the message
                recvMessage.content // The content of the message
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

