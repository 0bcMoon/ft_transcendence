import { FastifyRequest, FastifyReply } from "fastify";
import { userRepository } from "../repository/userRepository";


const User = {
    getContactList: async (req: FastifyRequest, reply: FastifyReply) => {
        const contacts = await userRepository.getContactList(req.user.id);
        return reply.status(200).send(contacts);
    },
    getMessages: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: number };
        const messages = await userRepository.getMessages(req.user.id, id);
        return reply.status(200).send(messages.reverse());
    },
    getChatRequests: async (req: FastifyRequest, reply: FastifyReply) => {
        const chatRequests = await userRepository.getChatRequests(req.user.id);
        return reply.status(200).send(chatRequests);
    },
    getFriends: async (req: FastifyRequest, reply: FastifyReply) => {
        const friends = await userRepository.getFriends(req.user.id);
        return reply.status(200).send(friends);
    },
    getUsersProfile: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: number };
        const friends = await userRepository.getUserById(id);
        return reply.status(200).send(friends);
    }
}


export default User;
