import { FastifyInstance } from "fastify";
import { WebSocket } from "@fastify/websocket";
import chatRepository from "./repository/chatRepository";
import { IEvent, isOnline, sendPayload } from "./notifications";
import { userRepository } from "./repository/userRepository";

interface RecvMessage {
    receiver_id: number,
    content: string,
}

const chatConnections: Map<number, WebSocket> = new Map();

async function NotifyOnlineUser(userId: number, senderId: number, message: string) {


    if (chatConnections.has(userId) || !isOnline(userId)) {
        return; // User is online, no need to send notification
    }


    const user = await userRepository.getCurrentUserById(senderId);
    if (!user) {
        return;
    }

    const notificationPayload: IEvent = {
        type: "message",
        message_payload: {
            username: user.username,
            content: message,
            profile_picture: user.image_src + user.profile_picture
        },
    };

    sendPayload(userId, notificationPayload);
}
export default async function(fastify: FastifyInstance) {
    fastify.get('/chat', { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {

        if (chatConnections.has(req.user.id)) {
            chatConnections.get(req.user.id)?.close();
        }

        chatConnections.set(req.user.id, socket)
        socket.on('message', async (message) => {
            try {
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
                if (chatConnections.has(req.user.id)) {
                    console.log(`Sending message to user ${req.user.id}`);
                }
                chatConnections.get(payload.receiver_id)?.send(receiver_string);
                NotifyOnlineUser(payload.receiver_id, req.user.id, payload.content);
            } catch (error) {
                fastify.log.error(`Error processing message from user ${req.user.id}: ${error}`);
            }
        });

        socket.on('close', () => {
            console.log(`WebSocket closed for user ${req.user.id}`);
            chatConnections.delete(req.user.id);
        });
    });
};

