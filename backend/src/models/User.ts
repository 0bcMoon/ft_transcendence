import { FastifyRequest, FastifyReply } from "fastify";
import { userRepository } from "../repository/userRepository";


//sync with jwt payload
interface AuthUser {
    payload: {
        id: number;
        username: string;
    }
}

const User = {

    getContactList: async (req: FastifyRequest, reply: FastifyReply) => {
        const user = req.user as AuthUser;
        const userId = user.payload.id;
        console.log("user ", userId);
        const contacts = await userRepository.getContactList(userId);
        return reply.status(200).send(contacts);
    }
}


export default User;
