import { FastifyRequest, FastifyReply } from "fastify";
import { userRepository } from "../repository/userRepository";

interface IRequestHandlerBody {
    req_id: number;
    user_id: number;
    type: string;
    action: boolean;
}

interface IBlockHandlerBody {
    user_id: number;
    action: boolean; // true for block, false for unblock
}
interface ICreateRequestBody {
    user_id: number;
    type: 'friend' | 'chat'
}

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
        const { user_id } = req.body as { user_id: number, type: number }
        if (user_id === req.user.id) {
            return reply.status(400).send({ message: "you cannot send friend request to yourself" });
        }

        const user = await userRepository.getUserById(req.user.id, user_id) 
        if (!user) {
            return reply.status(404).send({ message: "user does not exists" });
        }

        switch (user.relation_status) {
            case "friend":
                return reply.status(400).send({ message: "you are already friends" });
            case "blocking":
            case "blocked_by":
                return reply.status(403).send({ message: "you are blocked by this user" });
        }

        const result = await userRepository.createFriendRequests(req.user.id, user_id);
        if (!result) {
            return reply.status(400).send({ message: "friend request already exists" });
        }

        return reply.status(200).send({ message: 'friend request sent' });
    },

    createRequests: async (req: FastifyRequest, reply: FastifyReply) => {
        const { type, user_id } = req.body as ICreateRequestBody;

        if (user_id === req.user.id) {
            return reply.status(400).send({ message: "you cannot send request to yourself" });
        }

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
    deleteRequest: async (req: FastifyRequest, reply: FastifyReply) => {
        const { req_id } = req.params as { req_id: number };
        const result = await userRepository.cancelFriendRequest(req_id, req.user.id);
        if (result) {
            return reply.status(200).send({ message: 'friends request has been deleted' });
        }
        return reply.status(404).send({ message: 'no friends request found' });
    },

    HandelRequests: async (req: FastifyRequest, reply: FastifyReply) => {
        const { type } = req.body as IRequestHandlerBody;

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
        const { req_id, action, user_id } = req.body as IRequestHandlerBody;

        switch (action) {
            case true:
                const result = await userRepository.acceptFriendRequest(req_id, req.user.id, user_id);
                if (!result) {
                    return reply.status(404).send({ message: 'no friends request found' });
                }
                return reply.status(200).send({ message: 'friends request has been accepted' });
            case false:
                const deleteResult = await userRepository.deleteFriendRequest(req_id, req.user.id);
                if (!deleteResult) {
                    return reply.status(404).send({ message: 'no friends request found' });
                }
                return reply.status(200).send({ message: 'friends request has been deleted' });
        }
    },

    handelBlock: async (req: FastifyRequest, reply: FastifyReply) => {
        // action: true for block, false for unblock
        const { user_id, action } = req.body as IBlockHandlerBody;

        if (user_id === req.user.id) {
            return reply.status(400).send({ message: "you cannot block yourself" });
        }

        const user = await userRepository.getUserById(req.user.id, user_id)
        if (!user) {
            return reply.status(404).send({ message: "user does not exists" });
        }
        switch (user.relation_status) {
            case "blocking":
                if (action) {
                    return reply.status(400).send({ message: "you have already blocked this user" });
                }
                const unblockResult = await userRepository.unblockUser(req.user.id, user_id);
                if (unblockResult) {
                    return reply.status(200).send({ message: 'user has been unblocked' });
                }
                break;
            case "blocked_by":
                if (!action) {
                    return reply.status(400).send({ message: "you have already blocked this user" });
                }
                const blockResult = await userRepository.blockUser(req.user.id, user_id);
                if (blockResult) {
                    return reply.status(200).send({ message: 'user has been blocked' });
                }
                break;
            case "friend":
                if (action) {
                    await userRepository.deleteFriendship(req.user.id, user_id);
                    const blockResult = await userRepository.blockUser(req.user.id, user_id);
                    if (blockResult) {
                        return reply.status(200).send({ message: 'user has been blocked' });
                    }
                } else {
                    return reply.status(400).send({ message: "user is not blocked" });
                }
            case "pending":
            case "waiting":
                if (!action) {
                    return reply.status(400).send({ message: "user is not blocked" });
                }
                await userRepository.deleteRequests(req.user.id, user_id);
                const result = await userRepository.blockUser(req.user.id, user_id);
                if (result) {
                    return reply.status(200).send({ message: 'user has been blocked' });
                }
                return reply.status(400).send({ message: 'user has not been blocked' });
            case "none":
                if (action) {
                    const blockResult = await userRepository.blockUser(req.user.id, user_id);
                    if (blockResult) {
                        return reply.status(200).send({ message: 'user has been blocked' });
                    }
                }
                return reply.status(400).send({ message: "user is not blocked" });
        }
    },
    unFriends: async (req: FastifyRequest, reply: FastifyReply) => {
        const { user_id } = req.params as { user_id: number };

        if (user_id === req.user.id) {
            return reply.status(400).send({ message: "you cannot unfriend yourself" });
        }

        const user = await userRepository.getUserById(req.user.id, user_id);
        if (!user) {
            return reply.status(404).send({ message: "user does not exists" });
        }

        if (user.relation_status !== "friend") {
            return reply.status(400).send({ message: "you are not friends with this user" });
        }
        const result = await userRepository.deleteFriendship(req.user.id, user_id);
        if (result) {
            return reply.status(200).send({ message: 'you have unfriended this user' });
        }
        return reply.status(400).send({ message: 'you have not unfriended this user' });

    }
}

export default User;
