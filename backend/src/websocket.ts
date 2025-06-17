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

const validate = async (request: FastifyRequest, reply: FastifyReply) => {

    try {
        const { token } = request.query as { token: string }
        const decoded = fastify.jwt.verify(token)
        request.user = decoded as typeof request.user;
    } catch (error: any) {
        return reply.code(401).send({ message: error.message });
    }
}

export default async function(fastify: FastifyInstance) {
    fastify.get('/chat', { websocket: true, preValidation: validate }, (socket, req) => {
        // Add the new connection to the set
        chatConnections.set(req.user.id, socket)
        socket.on('message', async (message) => {
            const recvMessage: RecvMessage = JSON.parse(message.toString());

            // TODO: try and catch here to handle errors gracefully

            const result = await messageRepository.createMessage(
                req.user.id, // Assuming req.user.id is the sender's ID
                recvMessage.receiver_id, // The receiver's ID from the message
                recvMessage.content // The content of the message
            )

            // acknowledge the message to the sender and receiver
            const resultString = JSON.stringify(result);
            chatConnections.get(req.user.id)?.send(resultString);
            // TODO add also a notification to the receiver
            chatConnections.get(recvMessage.receiver_id)?.send(resultString);

            socket.on('close', () => {
                chatConnections.delete(req.user.id);
            });
        });
    });
};

