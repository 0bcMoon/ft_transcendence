import UserModel from '../models/UserModel.js';
import fastify from '../app.js';
import bycrypt from 'bcrypt';

const UserAuth = {

    login: async (req, reply) => {
        if (!req.body) {
            return reply.status(400).send({ error: 'Request body is required' });
        }
        const { username, password } = req.body;
        if (!username || !password) {
            return reply.status(400).send({ error: 'Username and password are required' });
        }
        const user = await UserModel.getUserByUsername(username);
        if (!user) {
            return reply.status(401).send({ error: 'Invalid username or password' });
        }
        const isPasswordValid = await bycrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return reply.status(401).send({ error: 'Invalid username or password' });
        }
        const token = fastify.jwt.sign({
            payload: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email
            }
        })
        user.token = token
        return reply.status(200).send({ message: 'Login successful', user });
    },

    register: async (req, reply) => {
        // const { username, password } = req.body;
        //
        // if (!username || !password) {
        //     return reply.status(400).send({ error: 'Username and password are required' });
        // }
        // const user = await UserModel.getUserByUsername(username);
        // if (!user) {
        //     return reply.status(401).send({ error: 'Invalid username or password' });
        // }
        // console.log(user)
        // return reply.status(200).send({ message: 'Login successful', user });
    }

}
export default UserAuth;
