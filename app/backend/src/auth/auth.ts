import { userRepository } from '../repository/userRepository';
import fastify, { FRONTEND_URL } from '../app';

import bcrypt from 'bcrypt';
import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleOAuth2, Intra42OAuth2 } from '../types/types';
import User from '../models/User';
import crypto from 'crypto';

interface LoginBody {
    username: string;
    password: string;
}
interface ITwoFactorAuth {
    confirmation_code: string;
    user_id: number;
}

const session = new Map<string, ITwoFactorAuth>();

interface IRegisterSession {
    confirmation_code: string;
    email: string;
}

interface IRegisterBody {
    username: string;
    display_name: string;
    password: string;
    email: string;
    confirmation_code: string;
}

const register = new Map<string, IRegisterSession>();

function generateRandomKey(length = 8) {
    const otp = crypto.randomBytes(length).toString('hex')
    return otp;
}

const Auth = {
    checkUsernameAvailability: async (req: FastifyRequest, reply: FastifyReply) => {
        const { username } = req.query as { username: string };
        if (!username) {
            return reply.status(400).send({ message: "username is require" });
        }
        const existingUser = await userRepository.getUserByUsername(username);
        if (existingUser) {
            return reply.status(409).send({ message: 'Username already exists' });
        }
        return reply.status(200).send({ message: 'Username is available' });
    },
    confirm_email: async ( email: string, confirmation_code: string) => {
        const session_key = crypto.randomBytes(24).toString('hex')
        const code = crypto.randomBytes(4).toString('hex');

        // await sendEmail(email, "Email Confirmation", `Your confirmation code is: ${code}`)

        //
    },

    SendConfirmationCode: async (req: FastifyRequest, reply: FastifyReply) => {

        const { email } = req.body as { email: string };


        if (!email) {
            return reply.status(400).send({ message: "email is require" });
        }

        const existingEmail = await userRepository.getUserByEmail(email);
        if (existingEmail) {
            return reply.status(409).send({ message: 'Email already exists' });
        }

        const session_key = generateRandomKey(24)
        const code = generateRandomKey(4);

        // const _ = await sendEmail(email, "Email Confirmation", `Your confirmation code is: ${code}`)

        // email is expensive operation, so we will just log it
        console.log(`-------------------------------`);
        console.log(`Sending email2 to ${email} with code: ${code}`);
        console.log(`-------------------------------`);

        

        reply
            .setCookie('session_key', session_key, {
                path: '/',
                secure: true, // send cookie over HTTPS only
                domain: process.env.COOKIE_DOMAIN || 'localhost', // set the domain for the cookie
                maxAge: 15 * 60, // 15 minutes
                sameSite: true, // TODO: whats is CSRF alternative CSRF protection
            })
        register.set(session_key, { confirmation_code: code, email: email });
        return reply.status(200).send({});
    },
    TwoFactorAuthLogin: async (req: FastifyRequest, reply: FastifyReply) => {
        const { confirmation_code } = req.query as { confirmation_code: string };

        if (!confirmation_code) {
            return reply.status(400).send({ message: "confirmation_code is require" });
        }

        const session_key = req.cookies.session_key;
        if (!session_key) {
            return reply.status(401).send({ message: 'Unauthorized: No session key provided' });
        }
        const session_data = session.get(session_key);
        if (!session_data) {
            return reply.status(401).send({ message: 'Unauthorized: Invalid session key' });
        }

        const user = await userRepository.getCurrentUserById(session_data.user_id);
        if (!user) { // make typescript happy
            return reply.status(404).send({ message: 'User not found' });
        }

        if (!user.two_factor_enabled) {
            return reply.status(400).send({ message: "Two Factor Auth is not enabled" });
        }

        if (session_data.confirmation_code !== confirmation_code) {
            return reply.status(400).send({ message: "invalid confirmation code" });
        }
        Auth.grantAccess(reply, user.id);
        return reply.status(200).send({
            message: 'Login successful',
        });

    },

    TwoFactorAuth: async (req: FastifyRequest, reply: FastifyReply) => {

        // TODO: add a cooldown time using redis

        const { confirmation_code, action } = req.query as { confirmation_code: string, action: boolean };
        if (action === undefined) {
            return reply.status(400).send({ message: "action is require" });
        }
        const user = await userRepository.getCurrentUserById(req.user.id);

        if (!user) { // make typescript happy
            return reply.status(404).send({ message: 'User not found' });
        }
        if (user.two_factor_enabled === false && action === false) {
            return reply.status(400).send({ message: "Two Factor Auth already Enable" });
        }

        if (!user.two_factor_enabled && !action) {
            return reply.status(400).send({ message: "Two Factor Auth already disable" });
        }

        if (!confirmation_code) {
            return await User.sendEmailConfirmation(req.user.id, user?.email, reply);
        }

        if (!User.confirmtion_code_match(user.id, user.email, confirmation_code)) {
            return reply.status(400).send({ message: "invalid confirmation code" });
        }
        await userRepository.updateUserTwoFactorAuth(user.id, !user.two_factor_enabled);
        return reply.status(200).send({ message: `Two-factor authentication ${action ? 'Enabled' : 'disabled'} successful` });
    },

    TwoFactorAuthSetup: async (reply: FastifyReply, id: number, email: string) => {


        const session_key = generateRandomKey(24)
        const code = generateRandomKey(4);
        // await sendEmail(email, "Email Confirmation", `Your confirmation code is: ${code}`)

        //
        // // email is expensive operation, so we will just log it
        console.log(`-------------------------------`);
        console.log(`Sending email to ${email} with code: ${code}`);
        console.log(`-------------------------------`);


        reply
            .setCookie('session_key', session_key, {
                path: '/',
                secure: true, // send cookie over HTTPS only
                domain: process.env.COOKIE_DOMAIN || 'localhost', // set the domain for the cookie
                maxAge: 15 * 60, // 15 minutes
                sameSite: true, // TODO: whats is CSRF alternative CSRF protection
            })
        session.set(session_key, { confirmation_code: code, user_id: id });

        return reply.status(200).send({
            message: 'Two-factor authentication is enabled on your account. Please check your email for the confirmation code to complete the login process.',
            two_factor_enabled: true,
        });

    },

    login: async (req: FastifyRequest, reply: FastifyReply) => {

        const { username, password } = req.body as LoginBody;
        if (!username || !password) {
            return reply.status(400).send({ message: 'Invalid username or password' });
        }
        const user = await userRepository.getUserByUsername(username);
        if (!user) {
            return reply.status(401).send({ message: 'Invalid username or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password!);
        if (!isPasswordValid) {
            return reply.status(401).send({ message: 'Invalid username or password' });
        }

        if (user.two_factor_enabled) {
            return await Auth.TwoFactorAuthSetup(reply, user.id, user.email);
        }
        Auth.grantAccess(reply, user.id);
        return reply.status(200).send({
            message: 'Login successful',
        });
    },

    register: async (req: FastifyRequest, reply: FastifyReply) => {

        const { username, display_name, password, email, confirmation_code } = req.body as IRegisterBody;

        const session_key = req.cookies.session_key;

        if (!session_key) {
            return reply.status(401).send({ message: 'Unauthorized: No session key provided' });
        }

        const session_data = register.get(session_key);
        register.delete(session_key);

        if (!session_data) {
            return reply.status(401).send({ message: 'Unauthorized: Invalid session key' });
        }
        if (session_data.email !== email) {
            return reply.status(400).send({ message: 'Email does not match the one used for confirmation code' });
        }
        if (session_data.confirmation_code !== confirmation_code) {
            return reply.status(400).send({ message: 'Invalid confirmation code' });
        }
        const existingUser = await userRepository.getUserByUsername(username);
        if (existingUser) {
            return reply.status(409).send({ message: 'Username already exists' });
        }
        const existingEmail = await userRepository.getUserByEmail(email);
        if (existingEmail) {
            return reply.status(409).send({ message: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let backend_url = process.env.BACKEND_URL || 'http://localhost:3000';

        backend_url += "/public/"
        
        await userRepository.createUser({
            username,
            display_name,
            password: hashedPassword,
            email,
            image_src: backend_url,
            profile_picture: 'default.jpg',
            oauth_type: 'local'
        });

        return reply.status(201).send({ message: 'User registered successfully' });
    },

    logout: async (req: FastifyRequest, reply: FastifyReply) => {
        return reply
            .clearCookie('access_token')
            .clearCookie('refresh_token')
            .status(200)
            .send({ message: 'Logout successful' });
    },

    GoogleOAuth2: async (req: FastifyRequest, reply: FastifyReply) => {

        try {
            // TODO: use try catch to handle errors
            const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.access_token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                return reply.redirect(`${FRONTEND_URL}/login?error=Unable to create or authenticate user`);
            }
            const user_data = await response.json() as GoogleOAuth2;
            const id = await User.googleLogin(user_data)
            if (!id) {
                return reply.redirect(`${FRONTEND_URL}/login?error=email already exists with another account`);
            }
            Auth.grantAccess(reply, id);
            reply.redirect(FRONTEND_URL); // Redirect to the home page or any other page after successful login
            return reply;
        } catch (error) {
            return reply.redirect(`${FRONTEND_URL}/login?error=An error occurred during authentication`);
        }
    },


    Intra42OAuth2: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { token } = await fastify.intra42OAuth2.getAccessTokenFromAuthorizationCodeFlow(req)
            const response = await fetch('https://api.intra.42.fr/v2/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.access_token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                return reply.redirect(`${FRONTEND_URL}/login?error=Unable to create or authenticate user`);
            }

            const user_data = await response.json() as Intra42OAuth2;
            const id = await User.intraLogin(user_data)

            if (!id) {
                return reply.redirect(`${FRONTEND_URL}/login?error=email already exists with another account`);
            }
            Auth.grantAccess(reply, id);
            reply.redirect(FRONTEND_URL); // Redirect to the home page or any other page after successful login
            return reply;
        } catch (error) {
            return reply.redirect(`${FRONTEND_URL}/login?error=An error occurred during authentication`);
        }
    },

    grantAccess: async (reply: FastifyReply, user_id: number) => {

        const access_token = fastify.jwt.sign({
            id: user_id,
        }, {
            expiresIn: process.env.ACCESS_TOKEN_EXPR || '10m' // Token expiration time
        },
        )

        const refresh_token = fastify.jwt.sign({
            id: user_id,
        }, {
            expiresIn: process.env.REFRESH_TOEKN_EXPR || '30d' // Token expiration time
        },
        )

        reply
            .setCookie('access_token', access_token, {
                path: '/',
                secure: true, // send cookie over HTTPS only
                domain: process.env.COOKIE_DOMAIN || 'localhost', // set the domain for the cookie
                maxAge: 30 * 24 * 60 * 60, // 30 days
                sameSite: true, // alternative CSRF protection
            })

        reply
            .setCookie('refresh_token', refresh_token, {
                path: '/',
                secure: true, // send cookie over HTTPS only
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60, // 30 days
                domain: process.env.COOKIE_DOMAIN || 'localhost', // set the domain for the cookie
                sameSite: true // alternative CSRF protection
            })
        reply.clearCookie('session_key');
    },
}

export default Auth;
