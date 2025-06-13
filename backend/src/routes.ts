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

        return userRepository.getUserById(request.user.id);
    })

    fastify.get('/friends', { onRequest: fastify.authenticate }, User.getFriends)
    fastify.get('/friends/:id', { onRequest: fastify.authenticate }, User.getContactList)

    fastify.get('/chat/contacts', { onRequest: fastify.authenticate }, User.getContactList)
    fastify.get('/chat/:id/messages', { onRequest: fastify.authenticate }, User.getMessages)

    fastify.post('/login', UserAuth.login)
    fastify.post('/register', UserAuth.login)
}


