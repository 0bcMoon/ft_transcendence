import { FastifyRequest, FastifyReply } from "fastify";
import { User, userRepository } from "../repository/userRepository";
import path from "path";
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import bcrypt from 'bcrypt';
import { CreateUser, GoogleOAuth2 } from "../types/types";

interface IUserUpdateInfo {
    display_name?: string;
    username?: string;
    current_password?: string;
    new_password?: string;
}

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
        let friends;
        if (search)
            friends = await userRepository.findFriends(req.user.id, search);
        else
            friends = await userRepository.getFriends(req.user.id);
        const new_friends = friends.map(friend => ({ ...friend, profile_picture: friend.image_src + friend.profile_picture }));
        return reply.status(200).send(new_friends);
    },

    getUsersProfile: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: number };
        const user = await userRepository.getUserById(req.user.id, id);
        if (!user) return reply.status(200).send({ message: "User not found" });
        user.profile_picture = user.image_src + user.profile_picture;
        return reply.status(200).send(user);
    },

    findUsers: async (req: FastifyRequest, reply: FastifyReply) => {
        const { search } = req.query as { search: string };
        let users;
        if (!search)
            users = await userRepository.getAllUsers(req.user.id);
        else
            users = await userRepository.findUsers(search);
        const updatedUsers = users?.map(user => ({ ...user, profile_picture: user.image_src + user.profile_picture }));

        return reply.status(200).send(updatedUsers || []);
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
                return reply.status(200).send(friendRequests.map(request => ({ ...request, profile_picture: request.image_src + request.profile_picture })));
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

    },

    getBlockedUsers: async (req: FastifyRequest, reply: FastifyReply) => {
        const blockedUsers = await userRepository.getBlockedUsers(req.user.id);
        const updatedBlockedUsers = blockedUsers?.map(user => ({ ...user, profile_picture: user.image_src + user.profile_picture }));
        return reply.status(200).send(updatedBlockedUsers || []);
    },


    updateProfilePicture: async (req: FastifyRequest, reply: FastifyReply) => {
        const data = await req.file();
        if (!data) {
            return reply.status(400).send({ message: 'No file uploaded' });
        }
        const extension = path.extname(data.filename);
        const uniqueFilename = `${randomUUID()}${extension}`;

        // Define the path where the file will be saved
        const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR!);
        const filePath = path.join(uploadDir, uniqueFilename);
        console.log(uploadDir, filePath)


        await pipeline(data.file, createWriteStream(filePath));
        const result = await userRepository.updateProfilePicture(req.user.id, uniqueFilename);
        if (result === undefined) {
            await fs.unlink(filePath); // Clean up the file if the update fails
            return reply.status(400).send({ message: 'Failed to update profile image' });
        }
        if (result && result !== "default.jpg") {
            try {
                await fs.unlink(path.join(process.cwd(), process.env.UPLOAD_DIR!, result));
            } catch (error) {
                console.error('Error deleting old profile image:', error);
            }

        }
        reply.send({ message: 'Profile image Updated successfully' });
    },

    getUserProfile: async (req: FastifyRequest, reply: FastifyReply) => {
        const user = await userRepository.getCurrentUserById(req.user.id);
        if (!user) {
            return reply.status(404).send({ message: "user not found" });
        }

        user.profile_picture = user.image_src + user.profile_picture;

        return reply.status(200).send({
            id: user.id,
            display_name: user.display_name,
            username: user.username,
            email: user.email,
            profile_picture: user.profile_picture
        });
    },
    isValidUsername: async (username: string | undefined): Promise<boolean> => {
        if (!username) return false;

        const user = await userRepository.getUserByUsername(username);
        if (user) {
            return true;
        }
        return false;
    },
    isValidPassword: async (id: number, password: string | undefined): Promise<boolean> => {

        if (!password) return false;
        const curr_user = await userRepository.getCurrentUserById(id);
        const isPasswordValid = await bcrypt.compare(password, curr_user?.password!,);
        if (!isPasswordValid) {
            return true;
        }
        return false;
    },

    updateUserInfo: async (req: FastifyRequest, reply: FastifyReply) => {

        const { display_name, username, ...pass_info } = req.body as IUserUpdateInfo

        // Validate the input with Zod (ai)

        if (await User.isValidUsername(username)) {
            return reply.status(400).send({ message: "username already exists" })
        } else if (await User.isValidPassword(req.user.id, pass_info.current_password)) {
            return reply.status(400).send({ message: "old password does not match" })
        }
        const result = await userRepository.updateUserInfo(req.user.id, display_name, username, pass_info.new_password);
        // big problem here, is change are zero
        if (!result) {
            return reply.status(400).send({ message: "failed to update user info" });
        }
        return reply.status(200).send({ message: "user info updated successfully" });
    },
    googleLogin: async (user: GoogleOAuth2): Promise<number> => {

        const existing_user = await userRepository.getUserByEmail(user.email);


        if (existing_user) {
            return existing_user.id;
        }
        const new_user: CreateUser = {
            display_name: user.name,
            image_src: user.picture,
            email: user.email,

        };

        return await userRepository.createOauthUser(new_user);;
    }
}

export default User;
