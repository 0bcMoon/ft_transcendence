require('module-alias/register')

import db from '../db/db'
import UserAuth from './auth/auth'
import fastify from './app'

interface LoginBody {
  username: string;
  password: string;
}

fastify.get('/users', async (req, res) => {
    return await db.all('SELECT * FROM users')
})


fastify.post('/login', UserAuth.login)

fastify.get('/me', async (req, res) => {
    console.log(req.user)
    return await db.all('SELECT * FROM users')
})
// Run the server!
console.log('Server listening on http://localhost:3000')
fastify.listen({ port: 3000 })
