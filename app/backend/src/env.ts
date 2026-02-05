import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string()
        .transform((val) => parseInt(val, 10))
        .default('3000'),
    DB_NAME: z.string(),
    DB_SCHEMA: z.string(),
    JWT_SECRET: z.string(),
    FRONTEND_URL: z.string()
        .url(),
    BACKEND_URL: z.string()
        .url(),
    ACCESS_TOKEN_EXPR: z.string()
        .transform((val) => parseInt(val, 10))
        .default('900'),
    REFRESH_TOKEN_EXPR: z.string()
        .transform((val) => parseInt(val, 10))
        .default('604800'),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    INTRA_CLIENT_ID: z.string(),
    INTRA_CLIENT_SECRET: z.string(),
    INTRA_REDIRECT_URI: z.string()
        .url(),
    GOOGLE_REDIRECT_URI: z.string()
        .url(),
    SMTP_USER: z.string(),
    SMTP_FROM: z.string(),
    SMTP_PASS: z.string(),

    // Public API configs
    PUBLIC_API_KEYS: z.string(),                 // "key1,key2"
    PUBLIC_API_ADMIN_KEYS: z.string().default(""), // optional
    PUBLIC_API_RATE_LIMIT_MAX: z.coerce.number().default(60),
    PUBLIC_API_RATE_LIMIT_WINDOW: z.string().default("1 minute"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error(JSON.stringify(_env.error.format(), null, 2));
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
}

const env = _env.data;

export default env;
