import Fastify from 'fastify';
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import { FastifyRequest } from 'fastify/types/request';

const fastify = Fastify({
    logger: true
})

fastify.register(jwt, {
    secret: process.env.JWT_SECRET!
})


fastify.register(cors, {
    // Configure CORS options
    origin: ['http://localhost:5173'], // Reflects the request origin, or specify allowed origins like: ['http://localhost:5173']
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true, // Allows cookies to be sent with requests
    allowedHeaders: ['Content-Type', 'Authorization']
});

fastify.addHook('preHandler', async (request, reply) => {
    // Skip JWT validation for public routes like /login
    if (request.method === 'POST' && request.body === undefined) {
        return reply.status(400).send({ error: 'Request body is required' });
    }
    else if (request.url === '/login') {
        return;
    }
    try {
        await request.jwtVerify(); // Verify the JWT
        // If valid, request.user will contain the decoded payload
    } catch (err: any) {
        return reply.code(401).send({ message: err.message });
    }
});

export default fastify;
