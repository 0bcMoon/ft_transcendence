import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import chatSocket from "./websocket";
import gameSocket from "./gameSocket";
import metricsPlugin from 'fastify-metrics';

import routes from "./routes";
import auth from "./auth.routes";
// import game from "./game.routes";
import metricsRoutes from "./routes/metrics.routes";
import PingPongRoutes from "./routes/pingpong.routes";
import NotificationsRoutes from "./routes/notifications.routes";

import cookie from "@fastify/cookie";
import { mkdir } from "fs";
import staticPlugin from "@fastify/static";
import { serializerCompiler, validatorCompiler, ZodTypeProvider, } from "fastify-type-provider-zod";

import jwtConfig from "./auth/jwt";

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

// fastify.register(metricsPlugin, { endpoint: '/metrics' });

fastify.register(cookie);

fastify.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
        cookieName: "access_token",
        signed: false,
    },
});

fastify.register(jwtConfig);

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
fastify.register(websocket, {
    options: {
        maxPayload: 8 * 1024, // 8 KB
    },
});

// Routes
fastify.register(chatRoute, { prefix: "/api" });
fastify.register(routes, { prefix: "/api" });
fastify.register(auth, { prefix: "/api" });

fastify.register(PingPongRoutes, { prefix: "/api" });
fastify.register(NotificationsRoutes, { prefix: "/api" });
fastify.register(metricsRoutes);

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
    origin: true,
    methods: ["GET", "OPTIONS", "POST", "HEAD", "DELETE", "PATCH"], // Include both GET and OPTIONS
    allowedHeaders: ["Content-Type", "Authorization", "Upgrade", "Connection"],
    credentials: true,
    preflightContinue: true,
});

const uploadDir = path.join(process.cwd(), "/public/uploads");

mkdir(uploadDir, { recursive: true }, (err) => {
    if (err) throw err;
});

fastify.setErrorHandler((error, _, reply) => {
    if (error.validation) {
        reply.status(400).send({
            message: error.validation[0].message,
        });
        return;
    }
    reply.send(error);
});


export default fastify;
