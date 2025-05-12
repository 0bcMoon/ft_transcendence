
import Fastify from 'fastify'

import db from '../sql/db.js'
const fastify = Fastify({
    logger: true
})

fastify.get('/', async function handler(req, res) {
    console.log(req.headers)
    return { hello: 'world' }
})

// Run the server!
await fastify.listen({ port: 3000 })
db.close();
