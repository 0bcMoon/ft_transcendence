
import { FastifyPluginAsync } from 'fastify';
import Auth from './auth/auth';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginSchema, registerSchema } from './schema/user.schema';



const auth: FastifyPluginAsync = async (fastifyInstance, opts): Promise<void> => {

    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    fastify.post('/auth/login', { schema: { body: loginSchema, } }, Auth.login)
    fastify.post('/auth/register', { schema: { body: registerSchema } }, Auth.register)
    fastify.get('/auth/logout', Auth.logout)
    fastify.get('/auth/oauth/42/callback', Auth.Intra42OAuth2)
    fastify.get('/auth/oauth/google/callback', Auth.GoogleOAuth2)
    fastify.get('/auth/2fa', { onRequest: fastify.authenticate }, Auth.TwoFactorAuth)
    fastify.get('/auth/login/2fa', Auth.TwoFactorAuthLogin)
    fastify.post('/auth/send-confirmation-code', Auth.SendConfirmationCode)
    fastify.get('/auth/check-username', Auth.checkUsernameAvailability)
    fastify.post('/auth/forget-password', Auth.resetPassword)
    fastify.patch('/auth/reset-password', Auth.setPassword)
}

export default auth;
