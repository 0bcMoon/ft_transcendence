import { FastifyPluginAsync } from 'fastify';
import UserAuth from './auth/auth';
import User from './models/User';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginSchema } from './schema/zod-schema';

const routes: FastifyPluginAsync = async (fastifyInstance, opts): Promise<void> => {
    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    fastify.get('/user', async (request, reply) => {
        return ({ message: 'Hello World! user' })
    })

    fastify.get('/user/:id', { onRequest: fastify.authenticate }, User.getUsersProfile)


    fastify.get('/users', { onRequest: fastify.authenticate }, User.findUsers)
    fastify.get('/user/friends', { onRequest: fastify.authenticate }, User.getFriends)


    fastify.post('/user/requests', { onRequest: fastify.authenticate }, User.createRequests)
    fastify.patch('/user/requests', { onRequest: fastify.authenticate }, User.acceptRequests)
    fastify.get('/user/requests', { onRequest: fastify.authenticate }, User.getRequests)
    fastify.delete('/user/requests/:reqId', { onRequest: fastify.authenticate }, User.deleteRequests)

    fastify.get('/chat/contacts', { onRequest: fastify.authenticate }, User.getContactList)
    fastify.get('/chat/:id/messages', { onRequest: fastify.authenticate }, User.getMessages)


    fastify.post('/auth/login', {
        schema: {
            body: loginSchema
        }
    }, UserAuth.login)
    fastify.post('/auth/register', UserAuth.login)
    fastify.get('/auth/logout', UserAuth.logout)
}

export default routes;


