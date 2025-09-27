import app from '../src/app';
import supertest from 'supertest';

describe('Invalid Input Tests', () => {
    let token: string;
    const testUser = { id: 1, username: 'hicham' };

    beforeAll(async () => {
        await app.ready();
        token = app.jwt.sign({
            id: testUser.id,
            username: testUser.username,
        });
    });

    describe('POST /user/requests', () => {
        it('should return 400 if user_id is missing', async () => {
            const response = await supertest(app.server)
                .post('/user/requests')
                .set('Cookie', `access_token=${token}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('user_id is required');
        });

        it('should return 400 if user_id is not a number', async () => {
            const response = await supertest(app.server)
                .post('/user/requests')
                .set('Cookie', `access_token=${token}`)
                .send({ user_id: 'a' });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Expected number, received string');
        });
    });

    describe('PATCH /user/requests', () => {
        it('should return 400 if req_id is missing', async () => {
            const response = await supertest(app.server)
                .patch('/user/requests')
                .set('Cookie', `access_token=${token}`)
                .send({ user_id: 2, type: 'friend', action: true });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('request id is required');
        });

        it('should return 400 if user_id is missing', async () => {
            const response = await supertest(app.server)
                .patch('/user/requests')
                .set('Cookie', `access_token=${token}`)
                .send({ req_id: 1, type: 'friend', action: true });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('user_id is required');
        });

        it('should return 400 if type is missing', async () => {
            const response = await supertest(app.server)
                .patch('/user/requests')
                .set('Cookie', `access_token=${token}`)
                .send({ req_id: 1, user_id: 2, action: true });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('type is required');
        });

        it('should return 400 if action is missing', async () => {
            const response = await supertest(app.server)
                .patch('/user/requests')
                .set('Cookie', `access_token=${token}`)
                .send({ req_id: 1, user_id: 2, type: 'friend' });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('action is required');
        });

        it('should return 400 if type is invalid', async () => {
            const response = await supertest(app.server)
                .patch('/user/requests')
                .set('Cookie', `access_token=${token}`)
                .send({ req_id: 1, user_id: 2, type: 'invalid_type', action: true });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid enum value. Expected 'chat' | 'friend', received 'invalid_type'");
        });

        it('should return 400 if action is not a boolean', async () => {
            const response = await supertest(app.server)
                .patch('/user/requests')
                .set('Cookie', `access_token=${token}`)
                .send({ req_id: 1, user_id: 2, type: 'friend', action: 'invalid_action' });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Expected boolean, received string');
        });
    });

    describe('POST /user/block', () => {
        it('should return 400 if user_id is missing', async () => {
            const response = await supertest(app.server)
                .post('/user/block')
                .set('Cookie', `access_token=${token}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('user_id is required');
        });

        it('should return 400 if user_id is not a number', async () => {
            const response = await supertest(app.server)
                .post('/user/block')
                .set('Cookie', `access_token=${token}`)
                .send({ user_id: 'a' });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Expected number, received string');
        });


        it('should return 400 if action is missing', async () => {
            const response = await supertest(app.server)
                .post('/user/block')
                .set('Cookie', `access_token=${token}`)
                .send({ user_id: 123});
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('action is required');
        });
        it('should return 400 if action is not a boolean', async () => {
            const response = await supertest(app.server)
                .post('/user/block')
                .set('Cookie', `access_token=${token}`)
                .send({ user_id: 123, action: 'not_a_boolean' });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Expected boolean, received string');
        });


    });
});
