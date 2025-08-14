
import { FastifyPluginAsync } from 'fastify';
import UserAuth from './auth/auth';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginSchema } from './schema/zod-schema';
import { GoogleOAuth2 } from './types/types';


const auth: FastifyPluginAsync = async (fastifyInstance, opts): Promise<void> => {
    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    fastify.post('/auth/login', {
        schema: {
            body: loginSchema
        }
    }, UserAuth.login)

    fastify.get('/auth/logout', UserAuth.logout)
    fastify.post('/auth/register', UserAuth.login)


    fastify.get('/auth/oauth/42/callback', async (request, reply) => {

        const { token } = await fastify.intra42OAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
        //
        console.log('Access Token:', token)

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

    fastify.get('/auth/oauth/google/callback', UserAuth.GoogleOAuth2)


}

export default auth;
