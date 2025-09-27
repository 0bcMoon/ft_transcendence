import { FastifyPluginAsync } from 'fastify';
import User from './models/User';
import Game from './models/Game';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { requestHandlerBody, blockUserBody, createRequestBody, updateUserInfo as updateUserSchema, updateEmailSchema, updateUserInfo } from './schema/zod-schema';

const routes: FastifyPluginAsync = async (fastifyInstance, opts): Promise<void> => {
    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    // === USER ROUTES ===
    fastify.get('/user/friend-requests', { onRequest: fastify.authenticate }, User.getFriendRequests)
    fastify.post('/user/requests', { onRequest: fastify.authenticate, schema: { body: createRequestBody } }, User.createRequests);
    fastify.patch('/user/requests', { onRequest: fastify.authenticate, schema: { body: requestHandlerBody } }, User.HandelRequests);
    fastify.get('/user/requests', { onRequest: fastify.authenticate }, User.getRequests);

    fastify.get('/user', { onRequest: fastify.authenticate }, User.getUserProfile);
    fastify.get('/user/:id', { onRequest: fastify.authenticate }, User.getUsersProfile);
    fastify.get('/users', { onRequest: fastify.authenticate }, User.findUsers);
    fastify.get('/user/friends', { onRequest: fastify.authenticate }, User.getFriends);
    fastify.delete('/user/friends/:user_id', { onRequest: fastify.authenticate }, User.unFriends);
    fastify.get('/user/block', { onRequest: fastify.authenticate }, User.getBlockedUsers);
    fastify.post('/user/block', { onRequest: fastify.authenticate, schema: { body: blockUserBody } }, User.handelBlock);

    fastify.patch('/user/update/profile_picture', { onRequest: fastify.authenticate }, User.updateProfilePicture);
    fastify.patch('/user/update/info', { onRequest: fastify.authenticate, schema: { body: updateUserInfo } }, User.updateUserInfo);
    fastify.post('/user/update/email', { schema: { body: updateEmailSchema }, onRequest: fastify.authenticate }, User.updateEmail)

    fastify.delete('/user/requests/:req_id', { onRequest: fastify.authenticate }, User.deleteRequest);

    // === GAME ROUTES ===
    fastify.post('/game', { onRequest: fastify.authenticate }, Game.createGame);
    fastify.get('/game/:id', { onRequest: fastify.authenticate }, Game.getGameById);
    fastify.get('/games/recent', { onRequest: fastify.authenticate }, Game.getRecentGamesForUser);
    fastify.patch('/game/:id/status', { onRequest: fastify.authenticate }, Game.updateGameStatus);
    fastify.patch('/game/:id/finish', { onRequest: fastify.authenticate }, Game.finishGame);
    fastify.post('/game/player', { onRequest: fastify.authenticate }, Game.addPlayerToGame);
    fastify.patch('/game/player/stats', { onRequest: fastify.authenticate }, Game.updatePlayerStats);
    fastify.get('/game/:id/players', { onRequest: fastify.authenticate }, Game.getPlayersInGame);
    fastify.get('/user/stats', { onRequest: fastify.authenticate }, Game.getUserStats);
    fastify.patch('/user/stats', { onRequest: fastify.authenticate }, Game.updateUserStats);

};

export default routes;

