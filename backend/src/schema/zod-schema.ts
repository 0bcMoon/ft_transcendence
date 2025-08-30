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

export const registerSchema = z.object({
    username: z
        .string({ required_error: "Username is required" })
        .min(3)
        .max(20),
    display_name: z
        .string({ required_error: "Display name is required" })
        .min(3)
        .max(30),
    password: z
        .string({ required_error: "Password is required" })
        .min(8)
        .max(32),
    email: z
        .string({ required_error: "Email is required" })
        .email(),
}, {
    invalid_type_error: 'bad request body',
    required_error: 'bad request body',
});

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


export const updateUserInfo = z.object({
    display_name: z
        .string()
        .min(3)
        .max(32)
        .optional(),
    username: z
        .string()
        .min(3, "Username is required.")
        .max(24)
        .regex(/^\S+$/, 'Username cannot contain whitespace')
        .optional(),
    current_password: z
        .string()
        .min(8)
        .max(32)
        .optional(),
    new_password: z
        .string()
        .max(32)
        .min(8, "Password must be at least 8 characters long.")
        .regex(/[0-9]/, "Password must contain at least one number.")
        .regex(
            /[!@#$%^&*(),.?":{}|<>]/,
            "Password must contain at least one special character."
        )
        .optional(),

}).refine(data => (data.current_password && data.new_password)
    || (!data.current_password && !data.new_password),
    { message: 'Both current and new passwords must be provided together or not at all' })
    .refine(data => data.current_password
        || data.display_name || data.username,
        { message: 'At least one field must be updated' });

