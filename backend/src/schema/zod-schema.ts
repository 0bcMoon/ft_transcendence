import { z } from "zod";


export const loginSchema = z.object({
    username: z
        .string({ required_error: "Username is required" })
        .min(3)
        .max(20),
    password: z
        .string({ required_error: "Password is required" })
        .min(8)
        .max(32),
}, {
    invalid_type_error: 'bad request body',
    required_error: 'bad request body',
}
);

export const requestHandlerBody = z.object({
    req_id: z.number({ required_error: 'request id is required' }),
    user_id: z.number({ required_error: 'user_id is required' }),
    type: z.enum(['chat', 'friend'], { required_error: 'type is required' }),
    action: z.boolean({ required_error: 'action is required' }),

}, {
    invalid_type_error: 'bad request body',
    required_error: 'bad request body',
});

export const blockUserBody = z.object({
    user_id: z.number({ required_error: 'user_id is required' }),
    action: z.boolean({ required_error: 'action is required' }),

}, {
    invalid_type_error: 'bad request body',
    required_error: 'bad request body',
});

export const createRequestBody = z.object({
    user_id: z.number({ required_error: 'user_id is required' }),
    type: z.enum(['chat', 'friend'], { required_error: 'type is required' }),
}, {
    invalid_type_error: 'bad request body',
    required_error: 'bad request body',
});
