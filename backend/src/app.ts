import jwt, { FastifyJWT } from '@fastify/jwt'
import cors from '@fastify/cors'
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import websocket from '@fastify/websocket'
import wsRouter from './websocket'
import routes from './routes'
import cookie from '@fastify/cookie'
import pino from "pino";
import pretty from "pino-pretty";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';


declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            id: number,
            username: string
            iat: number,
            exp: number
        };
    }
}

declare module 'fastify' {

    type Authenticate = (
        request: FastifyRequest,
        reply: FastifyReply
    ) => Promise<void>;

    /** Apply the extension */
    interface FastifyInstance {
        authenticate: Authenticate,
    }
}
const fastify = Fastify({
    logger: process.env.NODE_ENV === 'test' ? false : {
        level: 'debug',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignoe: 'pid,hostname,remoteAddress,remotePort',
            }
        }
    },
}).withTypeProvider<ZodTypeProvider>()

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);


fastify.register(cookie)
fastify.register(jwt, {
    secret: process.env.JWT_SECRET!,
    cookie: {
        cookieName: 'access_token',
        signed: false
    }

})

fastify.register(websocket)

fastify.register(wsRouter);
fastify.register(routes);

fastify.register(cors, {
    // Configure CORS options
    origin: true, // Allow any origin for development (restrict this in production!)
    methods: ['GET', 'OPTIONS', 'POST', 'HEAD', 'DELETE', 'PATCH'], // Include both GET and OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection'],
    credentials: true,
    preflightContinue: true // Important for WebSocket connections
});


const refreshAcessToken = async (req: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        return reply.code(401).send({ message: 'Unauthorized: Session expired' });
    }
    try {
        const decoded = await fastify.jwt.verify(refreshToken) as FastifyJWT['user'];
        const newAccessToken = fastify.jwt.sign(
            {
                id: decoded.id,
                username: decoded.username,
            },
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPR || '10m', // Token expiration time
            }
        );

        reply
            .setCookie('access_token', newAccessToken, {
                path: '/',
                secure: true, // send cookie over HTTPS only
                domain: process.env.COOKIE_DOMAIN || 'localhost', // set the domain for the cookie
                sameSite: true // alternative CSRF protection
            })
        req.user = decoded; // Set the user in the request object
    }
    catch (error: any) {
        reply.clearCookie('access_token');
        reply.clearCookie('refresh_token');
        return reply.code(401).send({ message: 'Unauthorized: Invalid refresh token' });
    }
}
fastify.setErrorHandler((error, request, reply) => {
    // Check if the error is a Zod validation error
    if (error.validation) {
        // Return a 400 response with a simplified message
        reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            // Get the message from the first validation issue
            message: error.validation[0].message,
        });
        return;
    }

    // For all other errors, use the default handler
    reply.send(error);
});

fastify.decorate(
    'authenticate',
    async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            await req.jwtVerify({ onlyCookie: true });
        } catch (error: any) {
            switch (error.code) {
                case 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED':
                case 'FST_JWT_NO_AUTHORIZATION_IN_COOKIE':
                    refreshAcessToken(req, reply);
                    break;
                default:
                    return reply.code(401).send({ message: error.message });
            }
        }
    }
);

export default fastify;
