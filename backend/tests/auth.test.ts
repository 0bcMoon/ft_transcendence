import app from '../src/app';
import supertest from 'supertest';

describe('Auth API', () => {
    beforeAll(async () => {
        await app.ready();
    });
    describe('POST /auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await supertest(app.server)
                .post('/auth/login')
                .send({
                    username: 'hicham',
                    password: 'password'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login successful');
            expect(response.headers['set-cookie']).toBeDefined();

            // Check for access_token cookie
            const cookies = response.headers['set-cookie'] as unknown as string[];
            const accessTokenCookie = cookies?.find(
                (cookie: string) => cookie.startsWith('access_token=')
            );
            expect(accessTokenCookie).toBeDefined();

            // Check for refresh_token cookie
            const refreshTokenCookie = cookies?.find(
                (cookie: string) => cookie.startsWith('refresh_token=')
            );
            expect(refreshTokenCookie).toBeDefined();
        });

        it('should reject invalid credentials', async () => {
            const response = await supertest(app.server)
                .post('/auth/login')
                .send({
                    username: 'hicham',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid username or password');
        });

        it('should reject missing username', async () => {
            const response = await supertest(app.server)
                .post('/auth/login')
                .send({
                    password: 'password'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('username is required');
        });

        it('should reject missing password', async () => {
            const response = await supertest(app.server)
                .post('/auth/login')
                .send({
                    username: 'hicham'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('password is required');
        });

        it('should reject non-existent user', async () => {
            const response = await supertest(app.server)
                .post('/auth/login')
                .send({
                    username: 'nonexistent',
                    password: 'password'
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid username or password');
        });

        it('should reject on empty body', async () => {
            const response = await supertest(app.server)
                .post('/auth/login')
                .send();

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('bad request body');
        });
    });

    describe('GET /auth/logout', () => {
        it('should logout successfully', async () => {
            const response = await supertest(app.server)
                .get('/auth/logout');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logout successful');

            const clearCookieHeaders = response.headers['set-cookie'] as unknown as string[];
            expect(clearCookieHeaders).toBeDefined();
            expect(clearCookieHeaders?.some((cookie: string) =>
                cookie.includes('access_token=') && cookie.includes('Expires=')
            )).toBe(true);
        });
    });

    describe('Token Generation', () => {
        it('should generate valid JWT tokens', async () => {
            const response = await supertest(app.server)
                .post('/auth/login')
                .send({
                    username: 'hicham',
                    password: 'password'
                });

            expect(response.status).toBe(200);

            // Extract access token from cookie
            const cookies = response.headers['set-cookie'] as unknown as string[];
            const accessTokenCookie = cookies?.find(
                (cookie: string) => cookie.startsWith('access_token=')
            );

            const accessToken = accessTokenCookie!.split('=')[1].split(';')[0];

            // Verify token can be decoded
            const decoded = app.jwt.decode(accessToken) as any;
            expect(decoded.id).toBe(1);
            expect(decoded.exp).toBeDefined();
            expect(decoded.iat).toBeDefined();
        });
    });
});
