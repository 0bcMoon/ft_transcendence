import db from '../sql/db.js'
import UserAuth from './auth/auth.js'
import fastify from './app.js'

fastify.get('/users', async (req, res) => {
    return await db.all('SELECT * FROM users')
})

// fastify.get('/login', UserAuth.login)
fastify.post('/login', UserAuth.login)

fastify.get('/me', async (req, res) => {
    console.log(req.user)
    return await db.all('SELECT * FROM users')
})
// Run the server!
console.log('Server listening on http://localhost:3000')
fastify.listen({ port: 3000 })
