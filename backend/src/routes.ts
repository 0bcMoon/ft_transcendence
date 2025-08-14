import { FastifyPluginAsync } from 'fastify';
import UserAuth from './auth/auth';
import User from './models/User';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginSchema, requestHandlerBody, blockUserBody, createRequestBody, updateUserInfo } from './schema/zod-schema';

const routes: FastifyPluginAsync = async (fastifyInstance, opts): Promise<void> => {
    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    fastify.get('/api/user', { onRequest: fastify.authenticate }, User.getUserProfile)

    fastify.get('/user/:id', { onRequest: fastify.authenticate }, User.getUsersProfile)


    fastify.get('/users', { onRequest: fastify.authenticate }, User.findUsers)
    fastify.get('/user/friends', { onRequest: fastify.authenticate }, User.getFriends)
    fastify.delete('/user/friends/:user_id', { onRequest: fastify.authenticate }, User.unFriends) // unfriend


    fastify.get('/user/block', { onRequest: fastify.authenticate }, User.getBlockedUsers)

    fastify.post('/user/block', {
        onRequest: fastify.authenticate,
        schema: {
            body: blockUserBody
        }
    }, User.handelBlock)

    fastify.post('/user/requests', {
        onRequest: fastify.authenticate,
        schema: {
            body: createRequestBody
        }
    }, User.createRequests)

    fastify.patch('/user/requests', {
        onRequest: fastify.authenticate,
        schema: {
            body: requestHandlerBody
        }
    },
        User.HandelRequests
    )

    fastify.patch('/user/update/profile_picture', { onRequest: fastify.authenticate }, User.updateProfilePicture)
    fastify.patch('/user/update/info', {
        onRequest: fastify.authenticate
        , schema: {
            body: updateUserInfo
        }
    }, User.updateUserInfo)

    fastify.get('/user/requests', { onRequest: fastify.authenticate }, User.getRequests)

    fastify.delete('/user/requests/:req_id', { onRequest: fastify.authenticate }, User.deleteRequest)

    fastify.get('/chat/contacts', { onRequest: fastify.authenticate }, User.getContactList)

    fastify.get('/chat/:id/messages', { onRequest: fastify.authenticate }, User.getMessages)

}

export default routes;


