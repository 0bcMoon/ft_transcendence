import { z } from "zod";

export const usernameSchema = z.object({
    username: z.string()
        .trim()
        .min(3, "Username too short")
        .max(24, "Username too long")
        .regex(
            /^[a-zA-Z][a-zA-Z0-9_]*$/,
            'Username must start with a letter and can only contain letters, numbers, and underscores'
        ),
}, {
    invalid_type_error: 'bad request body',
    required_error: 'bad request body',
});

export const loginSchema = z.object({
    identifier: z.union([
        z.string()
            .trim()
            .email("Invalid email format")
            .max(128, "Email too long"),
        z.string()
            .trim()
            .min(3, "Username too short")
            .max(24, "Username too long")
            .regex(
                /^[a-zA-Z][a-zA-Z0-9_]*$/,
                'Username must start with a letter and can only contain letters, numbers, and underscores'
            ),
    ]),
    password: z.
        string({ required_error: 'password is required' })
        .trim()
        .min(8, "Password must be at least 8 characters long.")
        .max(64, 'Password too long'),

}, {
    invalid_type_error: 'bad request body',
    required_error: 'bad request body',
});


export const registerSchema = z.object({
    username: z.string()
        .trim()
        .min(3, "Username too short")
        .max(24, "Username too long")
        .regex(
            /^[a-zA-Z][a-zA-Z0-9_]*$/,
            'Username must start with a letter and can only contain letters, numbers, and underscores'
        ),
    display_name: z
        .string()
        .trim()
        .min(1, "Display name is required.")
        .max(64, "Display name cannot exceed 64 characters.")
        .regex(/^[a-zA-Z ]+$/, 'Display name can only contain letters and spaces'),
    email: z.string()
        .trim()
        .min(1, 'Email is required')
        .max(128, 'Email cannot exceed 128 characters')
        .email('Please enter a valid email address'),
    password: z.string()
        .trim()
        .min(8, "Password must be at least 8 characters long.")
        .max(64, "Password cannot exceed 64 characters."),
    confirmation_code: z
        .string({ required_error: "Confirmation code is required" })
        .trim()
        .length(8, "Confirmation code must be 8 characters long"),
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
        .trim()
        .min(1, "Display name is required.")
        .max(64, "Display name cannot exceed 64 characters.")
        .regex(/^[a-zA-Z ]+$/, 'Display name can only contain letters and spaces')
        .optional(),
    username: z
        .string()
        .trim()
        .min(3, "Username too short")
        .max(24, "Username too long")
        .regex(
            /^[a-zA-Z][a-zA-Z0-9_]*$/,
            'Username must start with a letter and can only contain letters, numbers, and underscores'
        )
        .optional(),
    current_password: z
        .string()
        .trim()
        .min(8, 'Password must be at least 8 characters long.')
        .max(64, 'Password too long')
        .optional(),
    new_password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters long.")
        .max(64)
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

export const updateEmailSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Invalid email address")
        .max(128, "Email too long"),
    confirmation_code: z
        .string()
        .trim()
        .length(8, "Confirmation code must be 8 characters long")
        .optional()
}, {
    invalid_type_error: 'bad request body',
    required_error: 'bad request body',
});


