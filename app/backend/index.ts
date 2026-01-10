require("module-alias/register");

import fastify from "./src/app";

const PORT: number = parseInt(process.env.PORT || "3000");

fastify.listen({ port: PORT, host:'0.0.0.0' });
