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
    createFriendRequests: async (req: FastifyRequest, reply: FastifyReply) => {
        const { userId } = req.body as { userId: number, type: number }
        if (userId === req.user.id) {
            return reply.status(400).send({ message: "you cannot send friend request to yourself" });
        }
        const friends = await userRepository.getUserById(req.user.id, userId) as { id: number, display_name: string, relation_status: string };
        switch (friends.relation_status) {
            case "friends":
                return reply.status(200).send({ message: "you are already friends" });
            case "blocked":
                return reply.status(403).send({ message: "you are blocked by this user" });
        }
        return {
            message: await userRepository.createFriendRequests(req.user.id, userId),
        }
    },

    createRequests: async (req: FastifyRequest, reply: FastifyReply) => {

        const { type } = req.body as { userId: number, type: string }
        switch (type) {
            case "friend":
                return User.createFriendRequests(req, reply);
            default:
                return reply.status(400).send({ message: "invalid request type" });
        }
    },
    getRequests: async (req: FastifyRequest, reply: FastifyReply) => {
        const { type } = req.query as { type: string };
        switch (type) {
            case "friend":
                const friendRequests = await userRepository.getFriendRequests(req.user.id);
                return reply.status(200).send(friendRequests);
            default:
                return reply.status(400).send({ message: "invalid request type" });
        }

    }
}


export default User;
