import { userRepository } from '../repository/userRepository';
import fastify from '../app';

import bcrypt from 'bcrypt';
import { FastifyRequest, FastifyReply } from 'fastify';

interface LoginBody {
    username: string;
    password: string;
}


const UserAuth = {

    login: async (req: FastifyRequest, reply: FastifyReply) => {
        const { username, password } = req.body as LoginBody;
        if (!username || !password) {
            return reply.status(400).send({ message: 'Username and password are required' });
        }
        const user = await userRepository.getUserByUsername(username);
        if (!user) {
            return reply.status(401).send({ message: 'Invalid username or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password!);
        if (!isPasswordValid) {
            return reply.status(401).send({ message: 'Invalid username or password' });
        }
        user.token = fastify.jwt.sign({
            payload: {
                id: user.id,
                username: user.username,
            }
        })
        const { password: hashedPassword, created_at, ...userResponse } = user;
        return reply.status(200).send(userResponse);
    },

    register: async (req: FastifyRequest, reply: FastifyReply) => {
        // const { username, password } = req.body;
        //
        // if (!username || !password) {
        //     return reply.status(400).send({ error: 'Username and password are required' });
        // }
        // const user = await UserModel.getUserByUsername(username);
        // if (!user) {
        //     return reply.status(401).send({ error: 'Invalid username or password' });
        // }
        // console.log(user)
        // return reply.status(200).send({ message: 'Login successful', user });
    }

}
export default UserAuth;
