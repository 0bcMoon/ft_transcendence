import { FastifyPluginAsync } from 'fastify';
import User from './models/User';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { requestHandlerBody, blockUserBody, createRequestBody, updateUserInfo as updateUserSchema, updateEmailSchema, updateUserInfo } from './schema/zod-schema';

const routes: FastifyPluginAsync = async (fastifyInstance, opts): Promise<void> => {
    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    // === USER ROUTES ===
    fastify.post('/user/requests', { onRequest: fastify.authenticate, schema: { body: createRequestBody } }, User.createRequests);
    fastify.patch('/user/requests', { onRequest: fastify.authenticate, schema: { body: requestHandlerBody } }, User.HandelRequests);
    fastify.post('/user/block', { onRequest: fastify.authenticate, schema: { body: blockUserBody } }, User.handelBlock);
    fastify.patch('/user/update/info', { onRequest: fastify.authenticate, schema: { body: updateUserInfo } }, User.updateUserInfo);
    fastify.post('/user/update/email', { onRequest: fastify.authenticate, schema: { body: updateEmailSchema } }, User.updateEmail)

    fastify.get('/user/friend-requests', { onRequest: fastify.authenticate }, User.getFriendRequests)
    fastify.get('/user/requests', { onRequest: fastify.authenticate }, User.getRequests);
    fastify.get('/user', { onRequest: fastify.authenticate }, User.getUserProfile);
    fastify.get('/user/:id', { onRequest: fastify.authenticate }, User.getUsersProfile);
    fastify.get('/users', { onRequest: fastify.authenticate }, User.findUsers);
    fastify.get('/user/friends', { onRequest: fastify.authenticate }, User.getFriends);
    fastify.delete('/user/friends/:user_id', { onRequest: fastify.authenticate }, User.unFriends);
    fastify.get('/user/block', { onRequest: fastify.authenticate }, User.getBlockedUsers);
    fastify.patch('/user/update/profile_picture', { onRequest: fastify.authenticate }, User.updateProfilePicture);
    fastify.delete('/user/requests/:req_id', { onRequest: fastify.authenticate }, User.deleteRequest);


};

export default routes;

