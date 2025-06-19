import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import UserAuth from './auth/auth'
import User from './models/User'
import { userRepository } from './repository/userRepository'
import { FastifyRequest } from 'fastify/types/request';

export default async function routes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
): Promise<void> {

    fastify.get('/user', async (request, reply) => {
        return ({message: 'Hello World! user'})
    })

    fastify.get('/user/:id', { onRequest: fastify.authenticate }, User.getUsersProfile)

    fastify.get('/user/friends/:id', { onRequest: fastify.authenticate }, User.getContactList)
    fastify.get('/user/friends', { onRequest: fastify.authenticate }, User.getFriends)

    fastify.get('/chat/contacts', { onRequest: fastify.authenticate }, User.getContactList)
    fastify.get('/chat/:id/messages', { onRequest: fastify.authenticate }, User.getMessages)

    fastify.post('/auth/login', UserAuth.login)
    fastify.post('/auth/register', UserAuth.login)
}


