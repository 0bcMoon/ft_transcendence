import { FastifyReply, FastifyRequest } from "fastify";
import chatRepository, { Contacts } from "../repository/chatRepository";
import { isOnline, subscribe } from "../notifications";

const Chat = {
    getContact: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.query as { id: number };

        const user = await chatRepository.getContact(req.user.id, id);
        if (!user) {
            return reply.status(404).send({ message: 'User not found' });
        }
        const contact: Contacts = {
            id: user.id,
            display_name: user.display_name,
            profile_picture: user.image_src + user.profile_picture,
            image_src: undefined,
            relation_status: user.relation_status,
            content: null,
            messsage_time: null
        }
        return reply.status(200).send(contact);
    },
    getContactsList: async (req: FastifyRequest, reply: FastifyReply) => {
        const contacts = await chatRepository.getContactListWithLastMessage(req.user.id);
        const sub: number[] = []
        contacts.forEach(element => {
            if (!element.relation_status.includes('blocked'))
                sub.push(element.id);
            element.profile_picture = element.image_src + element.profile_picture;
            element.image_src = undefined
            element.online_status = isOnline(element.id);
        });
        subscribe(req.user.id, sub);
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
