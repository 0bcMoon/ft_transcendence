import { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

export async function registerPublicApiDocs(fastify: FastifyInstance) {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Transcendence Public API",
        version: "1.0.0",
        description: "Public API secured with X-API-Key + rate limiting.",
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: { type: "apiKey", in: "header", name: "X-API-Key" },
        },
      },
      security: [{ ApiKeyAuth: [] }],
    },
  });

  await fastify.register(swaggerUI, { routePrefix: "/docs/public" });

  fastify.get("/docs/public.json", async () => fastify.swagger());
}
