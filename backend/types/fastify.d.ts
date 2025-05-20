import "fastify";
interface UserPayload {
    id: string;
    username: string;
}

declare module "fastify" {
    interface FastifyRequest {
        user: UserPayload;
    }
}
