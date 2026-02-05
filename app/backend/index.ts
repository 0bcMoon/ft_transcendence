require("module-alias/register");
import fastify from "./src/app";
import env from "./src/env";
fastify.listen({ port: env.PORT, host:'0.0.0.0' });
