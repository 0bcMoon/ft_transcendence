import { userRepository } from '../repository/userRepository';
import fastify from '../app';

import bcrypt from 'bcrypt';
import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleOAuth2 } from '../types/types';
import User from '../models/User';

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
        UserAuth.grantAccess(reply, user.id);
        return reply.status(200).send({
            message: 'Login successful',
        });
    },

    register: async (req: FastifyRequest, reply: FastifyReply) => {

    },

    logout: async (req: FastifyRequest, reply: FastifyReply) => {
        return reply
            .clearCookie('access_token')
            .clearCookie('refresh_token')
            .status(200)
            .send({ message: 'Logout successful' });
    },
    GoogleOAuth2: async (req: FastifyRequest, reply: FastifyReply) => {

        const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.access_token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            return reply.status(500).send({ message: 'Failed to fetch user data from Google' });
        }
        const user_data = await response.json() as GoogleOAuth2;
        const id = await User.googleLogin(user_data)
        UserAuth.grantAccess(reply, id);
        reply.redirect(process.env.FRONTEND_URL || "http://localhost:5173"); // Redirect to the home page or any other page after successful login
        return reply;
    },
    grantAccess: async (reply: FastifyReply, user_id: number) => {

        const access_token = fastify.jwt.sign({
            id: user_id,
        }, {
            expiresIn: process.env.ACCESS_TOKEN_EXPR || '10m' // Token expiration time
        },
        )

        const refresh_token = fastify.jwt.sign({
            id: user_id,
        }, {
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

    }

}
export default UserAuth;
