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

    // fastify.get('/user/friends/:id', { onRequest: fastify.authenticate }, User.getContactList)
    fastify.get('/user/friends', { onRequest: fastify.authenticate }, User.getFriends)
    fastify.get('/users', { onRequest: fastify.authenticate }, User.findUsers)

// /api/users/{userId}/friend-requests
    fastify.post('/user/friend-requests', { onRequest: fastify.authenticate }, User.friendRequests)

    fastify.get('/chat/contacts', { onRequest: fastify.authenticate }, User.getContactList)
    fastify.get('/chat/:id/messages', { onRequest: fastify.authenticate }, User.getMessages)

    fastify.post('/auth/login', UserAuth.login)
    fastify.post('/auth/register', UserAuth.login)
}


