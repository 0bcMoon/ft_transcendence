import Fastify from 'fastify';
import jwt from '@fastify/jwt'

const fastify = Fastify({
    logger: true
})

fastify.register(jwt, {
    secret: process.env.JWT_SECRET
})

fastify.addHook('preHandler', async (request, reply) => {
    // Skip JWT validation for public routes like /login
    if (request.url === '/login') {
        return;
    }

    // i hate try catch
    try {
        await request.jwtVerify(); // Verify the JWT
        // If valid, request.user will contain the decoded payload
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized', message: err.message });
    }
});

export default fastify;
