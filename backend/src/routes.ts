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

    fastify.post('/auth/login', {
        schema: {
            body: loginSchema
        }
    }, UserAuth.login)

    fastify.get('/auth/logout', UserAuth.logout)
    fastify.post('/auth/register', UserAuth.login)

    // fastify.get('/auth/oauth/42', async (request, reply) => {
    //     try {
    //         return fastify.intra42OAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    //     } catch (error) {
    //         fastify.log.error('OAuth start error:', error)
    //         return reply.status(500).send({ error: 'Failed to start OAuth flow' })
    //     }
    // })

    fastify.get('/auth/oauth/42/callback', async (request, reply) => {


        // Clear the state from session after verification
        const { token } = await fastify.intra42OAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
        //
        console.log('Access Token:', token)
        // console.debug('Access Token:', token.access_token)
        // console.debug('Token Type:', token.token_type)
        // console.debug('Expires In:', token.expires_in)

        // Fetch user data from 42 API
        const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.access_token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!userResponse.ok) {
            throw new Error(`42 API error: ${userResponse.status} ${userResponse.statusText}`)
        }
        const userData = await userResponse.json()
        return reply.status(200).send({ user: userData, token: token.access_token })
    })
}

export default routes;


