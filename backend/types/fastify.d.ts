import 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';

// declare module "@fastify/jwt" {
//     interface FastifyJWT {
//         user: {
//             id: number,
//             username: string
//         };
//     }
// }
// declare module 'fastify' {
//
//     /**
//      * Type function to extend FastifyInstance to work with hook authentication
//      * onRequest: [fastify.authenticate] defined at src\plugins\jwtVerification.ts
//      */
//     type Authenticate = (
//         request: FastifyRequest,
//         reply: FastifyReply
//     ) => Promise<void>;
//
//     /** Apply the extension */
//     interface FastifyInstance {
//         authenticate: Authenticate;
//     }
// }
