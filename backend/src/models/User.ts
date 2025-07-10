import { FastifyRequest, FastifyReply } from "fastify";
import { userRepository } from "../repository/userRepository";
import { assert } from "console";


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
        if (!friends) {
            return reply.status(404).send({ message: "user does not exists" });
        }

        switch (friends.relation_status) {
            case "friend":
                return reply.status(400).send({ message: "you are already friends" });
            case "blocked":
                return reply.status(403).send({ message: "you are blocked by this user" });
        }

        const result = await userRepository.createFriendRequests(req.user.id, userId);
        if (!result) {
            return reply.status(400).send({ message: "friend request already exists" });
        }

        return reply.status(200).send({ message: 'friend request sent' });
    },

    createRequests: async (req: FastifyRequest, reply: FastifyReply) => {
        const { type } = req.body as { userId: number, type: string }

        switch (type) {
            case "friend":
                return User.createFriendRequests(req, reply);
            case "chat":
                throw new Error("chat create requests not implemented yet");
            default:
                return reply.status(400).send({ message: "invalid request type" });
        }
    },

    getRequests: async (req: FastifyRequest, reply: FastifyReply) => {

        const { type } = req.query as { type: string };
        if (!type) {
            return reply.status(400).send({ message: "type is required" });
        }

        switch (type) {
            case "friend":
                const friendRequests = await userRepository.getFriendRequests(req.user.id);
                return reply.status(200).send(friendRequests);
            case "chat":
                throw new Error("chat requests not implemented yet");
            default:
                return reply.status(400).send({ message: "invalid request type" });
        }

    },
    deleteRequests: async (req: FastifyRequest, reply: FastifyReply) => {
        const { reqId } = req.params as { reqId: number };
        const result = await userRepository.deleteFriendRequest(reqId, req.user.id);
        if (result) {
            return reply.status(200).send({ message: 'friends request has been deleted' });
        }
        return reply.status(404).send({ message: 'no friends request found' });
    },

    HandelRequests: async (req: FastifyRequest, reply: FastifyReply) => {
        const { type } = req.body as { reqId: number, type: string, action: boolean };
        console.log("req Body ", req.body);
        
        switch (type) {
            case "friend":
                return User.HandelFriendRequest(req, reply);
            case "chat":
                throw new Error("chat accept requests not implemented yet");
            default:
                return reply.status(400).send({ message: "invalid request type" });
        }
    },

    HandelFriendRequest: async (req: FastifyRequest, reply: FastifyReply) => {
        const { reqId, action } = req.body as { reqId: number, type: string, action: boolean };

        switch (action) {
            case true:
                const result = await userRepository.acceptFriendRequest(reqId, req.user.id);
                if (!result) {
                    return reply.status(404).send({ message: 'no friends request found' });
                }
                return reply.status(200).send({ message: 'friends request has been accepted' });
            case false:
                const deleteResult = await userRepository.deleteFriendRequest(reqId, req.user.id);
                if (!deleteResult) {
                    return reply.status(404).send({ message: 'no friends request found' });
                }
                return reply.status(200).send({ message: 'friends request has been deleted' });
        }
    }
}


export default User;
