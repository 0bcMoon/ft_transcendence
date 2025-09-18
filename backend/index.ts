require("module-alias/register");

import fastify from "./src/app";

// Run the server!
console.log("Server listening on http://localhost:3000");
const PORT: number = parseInt(process.env.PORT_NUMBER || "3000");

fastify.listen({ port: PORT, host:'0.0.0.0' });
