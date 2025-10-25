import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import Chat from './models/Chat';


const chat: FastifyPluginAsync = async (fastifyInstance, opts): Promise<void> => {
    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    fastify.get('/chat/contacts',     { onRequest: fastify.authenticate }, Chat.getContactsList)
    fastify.get('/chat/contact',      { onRequest: fastify.authenticate }, Chat.getContact)
    fastify.get('/chat/:id/messages', { onRequest: fastify.authenticate }, Chat.getMessages)

}

export default chat;
