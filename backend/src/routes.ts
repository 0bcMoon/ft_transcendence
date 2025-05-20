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
        console.log(request.user.id)
        // return userRepository.getUserById();
    })
    fastify.get('/chat/contact', User.getContactList)
    fastify.post('/login', UserAuth.login)
}


