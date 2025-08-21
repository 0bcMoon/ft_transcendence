import jwt, { FastifyJWT } from "@fastify/jwt";
import cors from "@fastify/cors";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import websocket from "@fastify/websocket";
import wsRouter from "./websocket";
import gameRoute from "./gameRoute";

import routes from "./routes";
import auth from "./auth.routes";
import cookie from "@fastify/cookie";
import { mkdir } from "fs";
import staticPlugin from "@fastify/static";
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from "fastify-type-provider-zod";
// This import is essential. It loads the types from the plugin.
import multipart from "@fastify/multipart";
import path from "path";

import oauthPlugin, { OAuth2Namespace } from "@fastify/oauth2";

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
    type Authenticate = (
        request: FastifyRequest,
        reply: FastifyReply,
    ) => Promise<void>;

    /** Apply the extension */
    interface FastifyInstance {
        authenticate: Authenticate;
        intra42OAuth2: OAuth2Namespace;
        googleOAuth2: OAuth2Namespace;
    }
}

const fastify = Fastify({
    logger:
        process.env.NODE_ENV === "test"
            ? false
            : {
                level: "debug",
                transport: {
                    target: "pino-pretty",
                    options: {
                        colorize: true,
                        translateTime: "SYS:standard",
                        ignoe: "pid,hostname,remoteAddress,remotePort",
                    },
                },
            },
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(cookie, {
    secret: process.env.JWT_SECRET!,
    parseOptions: {},
});

fastify.register(jwt, {
    secret: process.env.JWT_SECRET!,
    cookie: {
        cookieName: "access_token",
        signed: false,
    },
});

fastify.register(oauthPlugin, {
    name: "intra42OAuth2",
    credentials: {
        client: {
            id: process.env.INTRA_CLIENT_ID!,
            secret: process.env.INTRA_CLIENT_SECRET!,
        },
        auth: {
            authorizeHost: "https://api.intra.42.fr",
            authorizePath: "/oauth/authorize",
            tokenHost: "https://api.intra.42.fr",
            tokenPath: "/oauth/token",
        },
    },
    startRedirectPath: "/auth/oauth/42",
    callbackUri: "http://localhost:3000/auth/oauth/42/callback",
    scope: ["public"],
});

fastify.register(oauthPlugin, {
    name: "googleOAuth2",
    credentials: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID!,
            secret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/auth/oauth/google",
    callbackUri: "http://localhost:3000/auth/oauth/google/callback",
    scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
    ],
});

fastify.register(websocket);
fastify.register(multipart);
fastify.register(routes);
fastify.register(gameRoute);
fastify.register(auth);
fastify.register(wsRouter);

fastify.register(staticPlugin, {
    root: path.join(process.cwd(), process.env.UPLOAD_DIR!),
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

const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR!);

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
        const newAccessToken = fastify.jwt.sign(
            {
                id: decoded.id,
            },
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPR || "10m", // Token expiration time
            },
        );

        reply.setCookie("access_token", newAccessToken, {
            path: "/",
            secure: true, // send cookie over HTTPS only
            domain: process.env.COOKIE_DOMAIN || "localhost", // set the domain for the cookie
            sameSite: true, // alternative CSRF protection
        });
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
            console.debug("JWT verification failed:", error);
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
