import app from '../src/app';
import supertest from 'supertest';
import { randomBytes } from 'crypto';

describe('User API', () => {
    let token: string;
    const testUser = {
        id: 1,
        username: 'hicham',
        password: 'password'
    };

    beforeAll(async () => {
        await app.ready();
        token = app.jwt.sign({
            id: testUser.id,
            username: testUser.username,
        });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('PATCH /user/update/info', () => {
        it('should update display_name successfully', async () => {
            const newDisplayName = 'New Name';
            const response = await supertest(app.server)
                .patch('/user/update/info')
                .set('Cookie', `access_token=${token}`)
                .send({
                    display_name: newDisplayName
                });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('user info updated successfully');
        });

        it('should update username successfully', async () => {
            const newUsername = `newuser_${randomBytes(4).toString('hex')}`;
            const response = await supertest(app.server)
                .patch('/user/update/info')
                .set('Cookie', `access_token=${token}`)
                .send({
                    username: newUsername
                });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('user info updated successfully');
        });

        it('should update password successfully', async () => {
            const response = await supertest(app.server)
                .patch('/user/update/info')
                .set('Cookie', `access_token=${token}`)
                .send({
                    current_password: 'password',
                    new_password: 'new_password_!@#123'
                });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('user info updated successfully');
        });

        it('should update all user info successfully', async () => {
            const newUsername = `newuser_${randomBytes(4).toString('hex')}`;
            const response = await supertest(app.server)
                .patch('/user/update/info')
                .set('Cookie', `access_token=${token}`)
                .send({
                    display_name: 'Another Name',
                    username: newUsername,
                    current_password: 'new_password_!@#123',
                    new_password: 'password1!'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('user info updated successfully');
        });

        it('should not update with existing username', async () => {
            const existingUsername = 'jebli';
            const response = await supertest(app.server)
                .patch('/user/update/info')
                .set('Cookie', `access_token=${token}`)
                .send({
                    username: existingUsername
                });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('username already exists');
        });

        it('should not update password with incorrect current_password', async () => {
            const response = await supertest(app.server)
                .patch('/user/update/info')
                .set('Cookie', `access_token=${token}`)
                .send({
                    current_password: 'wrong_password',
                    new_password: 'new_password_!@#123'
                });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('old password does not match');
        });

        it('should not update with invalid new_password', async () => {
            const response = await supertest(app.server)
                .patch('/user/update/info')
                .set('Cookie', `access_token=${token}`)
                .send({
                    current_password: 'password',
                    new_password: '123'
                });
            expect(response.status).toBe(400);
        });

        it('should not update with current_password but no new_password', async () => {
            const response = await supertest(app.server)
                .patch('/user/update/info')
                .set('Cookie', `access_token=${token}`)
                .send({
                    current_password: 'password'
                });
            expect(response.status).toBe(400);
        });

        it('should not update with new_password but no current_password', async () => {
            const response = await supertest(app.server)
                .patch('/user/update/info')
                .set('Cookie', `access_token=${token}`)
                .send({
                    new_password: 'new_password_!@#123'
                });
            expect(response.status).toBe(400);
        });

        it('should not update with no fields', async () => {
            const response = await supertest(app.server)
                .patch('/user/update/info')
                .set('Cookie', `access_token=${token}`)
                .send({});
            expect(response.status).toBe(400);
        });
    });
});
