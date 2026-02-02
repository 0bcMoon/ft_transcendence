import { FastifyPluginAsync } from "fastify";
import client from "prom-client";

const metricsRoutes: FastifyPluginAsync = async (fastify) => {
  // fastify.get("/metrics", a)\
  fastify.get("/metrics", async (request, reply) => {
    reply
      .header("Content-Type", client.register.contentType)
      .send(await client.register.metrics());
  });

  client.collectDefaultMetrics();

  fastify.get("/", async (request, reply) => {
    return "Hello from backend!";
  });


};


export default metricsRoutes;
