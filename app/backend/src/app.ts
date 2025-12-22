import jwt, { FastifyJWT } from "@fastify/jwt";
import cors from "@fastify/cors";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import websocket from "@fastify/websocket";
import chatSocket from "./websocket";
import gameSocket from "./gameSocket";

import routes from "./routes";
import auth from "./auth.routes";
import game from "./game.routes";
import cookie from "@fastify/cookie";
import { mkdir } from "fs";
import staticPlugin from "@fastify/static";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";

import multipart from "@fastify/multipart";
import path from "path";

import oauthPlugin, { OAuth2Namespace } from "@fastify/oauth2";
import chatRoute from "./chat.routes";
import notifications from "./notifications";

// ✅ NEW
import arenaRoutes from "./arena/arena.routes";
import arenaSocket from "./arenaSocket";

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

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
  type Authenticate = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

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
              ignore: "pid,hostname,remoteAddress,remotePort,req,res,responseTime",
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

fastify.register(multipart);
fastify.register(websocket);

// Routes
fastify.register(chatRoute, { prefix: "/api" });
fastify.register(routes, { prefix: "/api" });
fastify.register(auth, { prefix: "/api" });
fastify.register(game, { prefix: "/api" });

// ✅ NEW: Arena REST
fastify.register(arenaRoutes, { prefix: "/api" });

// WebSockets
fastify.register(gameSocket, { prefix: "/ws" });
fastify.register(chatSocket, { prefix: "/ws" });
fastify.register(notifications, { prefix: "/ws" });

// ✅ NEW: Arena WS
fastify.register(arenaSocket, { prefix: "/ws" });

fastify.register(staticPlugin, {
  root: path.join(process.cwd(), process.env.UPLOAD_DIR!),
  prefix: "/public/",
});

fastify.register(cors, {
  origin: true,
  methods: ["GET", "OPTIONS", "POST", "HEAD", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Upgrade", "Connection"],
  credentials: true,
  preflightContinue: true,
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
    const decoded = (await fastify.jwt.verify(refreshToken)) as FastifyJWT["user"];
    const newAccessToken = fastify.jwt.sign(
      { id: decoded.id },
      { expiresIn: process.env.ACCESS_TOKEN_EXPR || "10m" }
    );

    reply.setCookie("access_token", newAccessToken, {
      path: "/",
      secure: true,
      domain: process.env.COOKIE_DOMAIN || "localhost",
      sameSite: true,
    });
    req.user = decoded;
  } catch (error: any) {
    reply.clearCookie("access_token");
    reply.clearCookie("refresh_token");
    return reply.code(401).send({ message: "Unauthorized: Invalid refresh token" });
  }
};

fastify.setErrorHandler((error, _, reply) => {
  if (error.validation) {
    reply.status(400).send({ message: error.validation[0].message });
    return;
  }
  reply.send(error);
});

fastify.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    await req.jwtVerify({ onlyCookie: true });
  } catch (error: any) {
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
});

export default fastify;
