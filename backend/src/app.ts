import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import websocket from '@fastify/websocket'
import wsRouter from './websocket'
import cookie from '@fastify/cookie'
import { console } from 'inspector/promises';


declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            id: number,
            username: string
        };
    }
}

declare module 'fastify' {

    type Authenticate = (
        request: FastifyRequest,
        reply: FastifyReply
    ) => Promise<void>;

    /** Apply the extension */
    interface FastifyInstance {
        authenticate: Authenticate,
    }
}
const fastify = Fastify({
    logger: true
})


fastify.register(cookie)
fastify.register(jwt, {
    secret: process.env.JWT_SECRET!,
    cookie: {
        cookieName: 'access_token',
        signed: false // Set to true if you want to use signed cookies
    }

})

fastify.register(websocket)

fastify.register(wsRouter);

fastify.register(cors, {
    // Configure CORS options
    origin: 'http://localhost:5173', // Allow any origin for development (restrict this in production!)
    methods: ['GET', 'OPTIONS', 'POST', 'HEAD'], // Include both GET and OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection'],
    credentials: true,
    preflightContinue: true // Important for WebSocket connections
});



fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (error: any) {
            return reply.code(401).send({ message: error.message });
        }
    }
);

export default fastify;
