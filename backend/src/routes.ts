import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import UserAuth from './auth/auth'
import User from './models/User'

export default async function routes(
    fastify: FastifyInstance,
    _: FastifyPluginOptions
): Promise<void> {

    fastify.get('/user', async (request, reply) => {
        return ({ message: 'Hello World! user' })
    })
    //TODO: edit userRepository sender <=> receiver in friends

    fastify.get('/user/:id', { onRequest: fastify.authenticate }, User.getUsersProfile)

    fastify.get('/user/friends', { onRequest: fastify.authenticate }, User.getFriends)

    // /api/users/{userId}/friend-requests
    // whit a query parameter to type {friend, message}
    // fastify.get('/user/friends/:id', { onRequest: fastify.authenticate }, User.getContactList)

    fastify.post('/user/requests', { onRequest: fastify.authenticate }, User.createRequests)
    fastify.patch('/user/requests', { onRequest: fastify.authenticate }, User.acceptRequests)
    fastify.get('/user/requests', { onRequest: fastify.authenticate }, User.getRequests)
    fastify.delete('/user/requests/:reqId', { onRequest: fastify.authenticate }, User.deleteRequests)

    fastify.get('/chat/contacts', { onRequest: fastify.authenticate }, User.getContactList)
    fastify.get('/chat/:id/messages', { onRequest: fastify.authenticate }, User.getMessages)

    fastify.post('/auth/login', UserAuth.login)
    fastify.post('/auth/register', UserAuth.login)
    fastify.get('/auth/logout', UserAuth.logout)
}


