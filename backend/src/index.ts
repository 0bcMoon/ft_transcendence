require('module-alias/register')

import fastify from './app'
import routes from "./routes"

fastify.register(routes)

// Run the server!
console.log('Server listening on http://localhost:3000')
fastify.listen({ port: 3000 })
