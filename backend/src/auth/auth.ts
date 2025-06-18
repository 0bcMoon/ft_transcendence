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
            return reply.status(400).send({ message: 'Invalid username or password' });
        }
        const user = await userRepository.getUserByUsername(username);
        if (!user) {
            return reply.status(401).send({ message: 'Invalid username or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password!);
        if (!isPasswordValid) {
            return reply.status(401).send({ message: 'Invalid username or password' });
        }
        const token = fastify.jwt.sign({
            id: user.id,
            username: user.username,
        },
            {
                expiresIn: '24h' // Token expiration time
            },
        )
        reply
            .setCookie('access_token', token, {
                path: '/',
                secure: true, // send cookie over HTTPS only
                // httpOnly: true,
                domain: process.env.COOKIE_DOMAIN || 'localhost', // set the domain for the cookie
                sameSite: true // alternative CSRF protection
            })

        reply
            .setCookie('refresh_token', token, {
                path: '/',
                secure: true, // send cookie over HTTPS only
                httpOnly: true,
                domain: process.env.COOKIE_DOMAIN || 'localhost', // set the domain for the cookie
                sameSite: true // alternative CSRF protection
            })
        return reply.status(200).send({
            access_token: token
        });
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
