import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import env from '../env';
import { FastifyJWT } from '@fastify/jwt';

export default fp(async (fastify: FastifyInstance) => {
    // Now you have 'app' available here
    fastify.decorate(
        "authenticate",
        async (req: FastifyRequest, reply: FastifyReply) => {
            try {
                await req.jwtVerify({ onlyCookie: true });
            } catch (error: any) {
                switch (error.code) {
                    case "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED":
                    case "FST_JWT_NO_AUTHORIZATION_IN_COOKIE":
                    case "FST_JWT_INVALID_AUTHORIZATION_IN_COOKIE":
                        // You can now use app here if refreshAccessToken needs it
                        refreshAccessToken(req, reply);
                        break;
                    default:
                        reply.clearCookie("access_token");
                        reply.clearCookie("refresh_token");
                        return reply.code(401).send({ message: error.message });
                }
            }
        }
    );

    const refreshAccessToken = async (req: FastifyRequest, reply: FastifyReply) => {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            return reply.code(401).send({ message: "Unauthorized: Session expired" });
        }

        try {
            const decoded = (await fastify.jwt.verify(refreshToken)) as FastifyJWT["user"];
            const access_token = fastify.jwt.sign(
                { id: decoded.id },
                { expiresIn: env.ACCESS_TOKEN_EXPR },
            );

            reply
                .setCookie('access_token', access_token, {
                    path: '/',
                    secure: true,
                    maxAge: env.ACCESS_TOKEN_EXPR,
                    httpOnly: true,
                    sameSite: 'strict',
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
});
