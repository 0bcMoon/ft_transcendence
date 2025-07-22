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
        const access_token = fastify.jwt.sign({
            id: user.id,
            username: user.username,
        },
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPR || '10m' // Token expiration time
            },
        )

        const refresh_token = fastify.jwt.sign({
            id: user.id,
            username: user.username,
        },
            {
                expiresIn: process.env.REFRESH_TOEKN_EXPR || '30d' // Token expiration time
            },
        )

        reply
            .setCookie('access_token', access_token, {
                path: '/',
                secure: true, // send cookie over HTTPS only
                domain: process.env.COOKIE_DOMAIN || 'localhost', // set the domain for the cookie
                maxAge: 30 * 24 * 60 * 60, // 30 days
                sameSite: true, // alternative CSRF protection
            })


        reply
            .setCookie('refresh_token', refresh_token, {
                path: '/',
                secure: true, // send cookie over HTTPS only
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60, // 30 days
                domain: process.env.COOKIE_DOMAIN || 'localhost', // set the domain for the cookie
                sameSite: true // alternative CSRF protection
            })

        return reply.status(200).send(
            {
                message: 'Login successful',
            }
        );
    },

    register: async (req: FastifyRequest, reply: FastifyReply) => {

    },

    logout: async (req: FastifyRequest, reply: FastifyReply) => {
        return reply
            .clearCookie('access_token')
            .clearCookie('refresh_token')
            .status(200)
            .send({ message: 'Logout successful' });
    }

}
export default UserAuth;
