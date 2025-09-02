import { FastifyReply, FastifyRequest } from "fastify";
import  chatRepository  from "../repository/chatRepository";

const Chat = {
    getContactList: async (req: FastifyRequest, reply: FastifyReply) => {
        const contacts = await chatRepository.getContactList(req.user.id);
        contacts.forEach(element => {
            element.profile_picture = element.image_src + element.profile_picture;
            element.image_src = undefined
        });
        return reply.status(200).send(contacts);
    },

    getMessages: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: number };
        const messages = await chatRepository.getMessages(req.user.id, id);
        return reply.status(200).send(messages.reverse());
    },

    getChatRequests: async (req: FastifyRequest, reply: FastifyReply) => {
        const chatRequests = await chatRepository.getChatRequests(req.user.id);
        return reply.status(200).send(chatRequests);
    },
}
export default Chat;
