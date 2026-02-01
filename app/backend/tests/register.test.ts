import app from '../src/app';
import supertest from 'supertest';
import { randomBytes } from 'crypto';

describe('Auth API - Register', () => {
    beforeAll(async () => {
        await app.ready();
    });

    const generateRandomUser = () => {
        const randomString = randomBytes(4).toString('hex');
        return {
            username: `testuser_${randomString}`,
            display_name: `Test User ${randomString}`,
            password: `password_${randomString}A1!`,
            email: `testuser_${randomString}@test.com`,
        };
    };

    describe('Registration with missing fields', () => {
        it('should fail if username is missing', async () => {
            const { display_name, password, email } = generateRandomUser();
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send({ display_name, password, email });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Username is required');
        });

        it('should fail if display_name is missing', async () => {
            const { username, password, email } = generateRandomUser();
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send({ username, password, email });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Display name is required');
        });

        it('should fail if password is missing', async () => {
            const { username, display_name, email } = generateRandomUser();
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send({ username, display_name, email });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Password is required');
        });

        it('should fail if email is missing', async () => {
            const { username, display_name, password } = generateRandomUser();
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send({ username, display_name, password });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email is required');
        });
    });

    describe('Registration with invalid data', () => {
        it('should fail if username is too short', async () => {
            const newUser = { ...generateRandomUser(), username: 'a' };
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('String must contain at least 3 character(s)');
        });

        it('should fail if username is too long', async () => {
            const newUser = { ...generateRandomUser(), username: 'a'.repeat(21) };
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('String must contain at most 20 character(s)');
        });

        it('should fail if display_name is too short', async () => {
            const newUser = { ...generateRandomUser(), display_name: 'a' };
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('String must contain at least 3 character(s)');
        });

        it('should fail if display_name is too long', async () => {
            const newUser = { ...generateRandomUser(), display_name: 'a'.repeat(31) };
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('String must contain at most 30 character(s)');
        });

        it('should fail if password is too short', async () => {
            const newUser = { ...generateRandomUser(), password: 'a' };
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('String must contain at least 8 character(s)');
        });

        it('should fail if password is too long', async () => {
            const newUser = { ...generateRandomUser(), password: 'a'.repeat(33) };
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('String must contain at most 32 character(s)');
        });

        it('should fail if email is invalid', async () => {
            const newUser = { ...generateRandomUser(), email: 'invalid-email' };
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Invalid email');
        });

        it('should reject on empty body', async () => {
            const response = await supertest(app.server)
                .post('/api/auth/register')
                .send();

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('bad request body');
        });
    });
});
