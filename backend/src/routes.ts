import { FastifyPluginAsync } from 'fastify';
import Auth from './auth/auth';
import User from './models/User';
import Game from './models/Game';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { requestHandlerBody, blockUserBody, createRequestBody, updateUserInfo as updateUserSchema, updateEmailSchema } from './schema/zod-schema';

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
            body: updateUserSchema
        }
    }, User.updateUserInfo)

    //TODO: add schema validation

    fastify.post('/user/update/email', {
        schema: updateEmailSchema,
        onRequest: fastify.authenticate
    }, User.updateEmail)

    fastify.get('/user/requests', { onRequest: fastify.authenticate }, User.getRequests)
    fastify.get('/user/friend-requests', { onRequest: fastify.authenticate }, User.getFriendRequests)

    fastify.delete('/user/requests/:req_id', { onRequest: fastify.authenticate }, User.deleteRequest)


    // === GAME ROUTES ===
    fastify.get('/game/matches', { onRequest: fastify.authenticate }, Game.getUserMatches);
    fastify.get('/game/matches/:match_uuid', { onRequest: fastify.authenticate }, Game.getMatchDetails);
    fastify.get('/game/leaderboard', { onRequest: fastify.authenticate }, Game.getLeaderboard);
    fastify.post('/game/matches', { onRequest: fastify.authenticate }, Game.createTestMatch);

};

export default routes;

