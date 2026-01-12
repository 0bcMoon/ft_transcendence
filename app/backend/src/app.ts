import jwt, { FastifyJWT } from "@fastify/jwt";
import cors from "@fastify/cors";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import websocket from "@fastify/websocket";
import chatSocket from "./websocket";
import gameSocket from "./gameSocket";
import metricsPlugin from 'fastify-metrics';

import routes from "./routes";
import auth from "./auth.routes";
import game from "./game.routes";
import cookie from "@fastify/cookie";
import { mkdir } from "fs";
import staticPlugin from "@fastify/static";
import { serializerCompiler, validatorCompiler, ZodTypeProvider, } from "fastify-type-provider-zod";

// This import is essential. It loads the types from the plugin.
import multipart from '@fastify/multipart';
import path from 'path';

import oauthPlugin, { OAuth2Namespace } from '@fastify/oauth2';
import chatRoute from "./chat.routes";
import notifications from "./notifications";

import arenaRoutes from "./arena/arenaRoutes";
import arenaSocket from "./arena/arenaSocket";
import arenaMatchmakingRoutes from "./arena/matchmaking/arenaMatchmakingRoutes";
import arenaStatsRoutes from "./arena/stats/arenaStats.routes";
import env from "./env";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            id: number;
            iat: number;
            exp: number;
        };
    }
}

declare module "fastify" {
    type Authenticate = (request: FastifyRequest, reply: FastifyReply,) => Promise<void>;

    /** Apply the extension */
    interface FastifyInstance {
        authenticate: Authenticate;
        intra42OAuth2: OAuth2Namespace;
        googleOAuth2: OAuth2Namespace;
    }
}

const fastify = Fastify({
    logger:
    {
        level: "debug",
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
            },
        },
    },
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(metricsPlugin, { endpoint: '/metrics' });

fastify.register(cookie, {
    secret: env.JWT_SECRET,
    parseOptions: {},
});

fastify.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
        cookieName: "access_token",
        signed: false,
    },
});

fastify.register(oauthPlugin, {
    name: "intra42OAuth2",
    credentials: {
        client: {
            id: env.INTRA_CLIENT_ID,
            secret: env.INTRA_CLIENT_SECRET,
        },
        auth: {
            authorizeHost: "https://api.intra.42.fr",
            authorizePath: "/oauth/authorize",
            tokenHost: "https://api.intra.42.fr",
            tokenPath: "/oauth/token",
        },
    },
    startRedirectPath: "/api/auth/oauth/42",
    callbackUri: env.INTRA_REDIRECT_URI,
    scope: ["public"],
});

fastify.register(oauthPlugin, {
    name: "googleOAuth2",
    credentials: {
        client: {
            id: env.GOOGLE_CLIENT_ID,
            secret: env.GOOGLE_CLIENT_SECRET,
        },
        auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/api/auth/oauth/google",
    callbackUri: env.GOOGLE_REDIRECT_URI,
    scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
    ],
});

fastify.register(multipart);
fastify.register(websocket);

// Routes
fastify.register(chatRoute, { prefix: "/api" });
fastify.register(routes, { prefix: "/api" });
fastify.register(auth, { prefix: "/api" });
fastify.register(game, { prefix: "/api" });

fastify.register(arenaRoutes, { prefix: "/api" });
fastify.register(arenaMatchmakingRoutes, { prefix: "/api" });
fastify.register(arenaStatsRoutes, { prefix: "/api" });

fastify.register(gameSocket, { prefix: "/ws" });
fastify.register(arenaSocket, { prefix: "/ws" });
fastify.register(chatSocket, { prefix: "/ws" });
fastify.register(notifications, { prefix: "/ws" });

fastify.register(staticPlugin, {
    root: path.join(process.cwd(), "/public/uploads"),
    prefix: "/public/",
});


fastify.register(cors, {
    // Configure CORS options
    origin: true, // Allow any origin for development (restrict this in production!)
    methods: ["GET", "OPTIONS", "POST", "HEAD", "DELETE", "PATCH"], // Include both GET and OPTIONS
    allowedHeaders: ["Content-Type", "Authorization", "Upgrade", "Connection"],
    credentials: true,
    preflightContinue: true, // Important for WebSocket connections
});

const uploadDir = path.join(process.cwd(), "/public/uploads");

mkdir(uploadDir, { recursive: true }, (err) => {
    if (err) throw err;
});

const refreshAcessToken = async (req: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        return reply.code(401).send({ message: "Unauthorized: Session expired" });
    }

    try {
        const decoded = (await fastify.jwt.verify(
            refreshToken,
        )) as FastifyJWT["user"];
        const access_token = fastify.jwt.sign(
            {
                id: decoded.id,
            },
            {
                expiresIn: env.ACCESS_TOKEN_EXPR,
            },
        );

        reply
            .setCookie('access_token', access_token, {
                path: '/',
                secure: true,
                // domain: env.COOKIE_DOMAIN,
                maxAge: 30 * 24 * 60 * 60,
                sameSite: true,
            })
        req.user = decoded; // Set the user in the request object

    } catch (error: any) {
        reply.clearCookie("access_token");
        reply.clearCookie("refresh_token");
        return reply
            .code(401)
            .send({ message: "Unauthorized: Invalid refresh token" });
    }
};
fastify.setErrorHandler((error, _, reply) => {
    // Check if the error is a Zod validation error
    if (error.validation) {
        // Return a 400 response with a simplified message
        reply.status(400).send({
            message: error.validation[0].message,
        });
        return;
    }
    // For all other errors, use the default handler
    reply.send(error);
});

fastify.decorate(
    "authenticate",
    async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            await req.jwtVerify({ onlyCookie: true });
        } catch (error: any) {
            // console.debug("JWT verification failed:", error);
            switch (error.code) {
                case "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED":
                case "FST_JWT_NO_AUTHORIZATION_IN_COOKIE":
                case "FST_JWT_INVALID_AUTHORIZATION_IN_COOKIE":
                    refreshAcessToken(req, reply);
                    break;
                default:
                    reply.clearCookie("access_token");
                    reply.clearCookie("refresh_token");
                    return reply.code(401).send({ message: error.message });
            }
        }
    },
);

export default fastify;
