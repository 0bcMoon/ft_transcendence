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
        const { search } = req.query as { search: string };
        if (search) {
            const friends = await userRepository.findFriends(req.user.id, search);
            return reply.status(200).send(friends);
        }
        const friends = await userRepository.getFriends(req.user.id);
        return reply.status(200).send(friends);
    },
    getUsersProfile: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: number };
        const friends = await userRepository.getUserById(req.user.id, id);
        return reply.status(200).send(friends);
    },
    findUsers: async (req: FastifyRequest, reply: FastifyReply) => {
        const { search } = req.query as { search: string };
        if (!search)
            return reply.status(200).send([]); // maybe show some random friends suggestion
        const users = await userRepository.findUsers(search);
        return reply.status(200).send(users);

    },
    friendRequests: async (req: FastifyRequest, reply: FastifyReply) => {

        const { userId } = req.body as { userId: number }
        const status = await userRepository.createFriendRequests(req.user.id, userId)
        if (status)
            return {
                message: "friends request has been send"
            }

        return {
            message: "faild to send friends request"
        }
    }
}


export default User;
