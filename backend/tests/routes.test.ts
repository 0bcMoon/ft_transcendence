import app from '../src/app';
import supertest from 'supertest';
import { execSync } from 'child_process';
import { abort } from 'process';

describe('GET /users', () => {
    let token: string;
    const testUser = {
        id: 1,
        username: 'hicham',
    };

    beforeAll(async () => {
        await app.ready();
        // Generate a token
        token = app.jwt.sign({
            id: testUser.id,
            username: testUser.username,
        });
    });

    afterAll(async () => {
        // Close the app after tests
        // run npm migrate to reset the database as child process


        try {
            execSync('npm run migrate');
        } catch (error) {
            abort();
        }
        await app.close();

    });


    it('should return a list of users with a valid token in a cookie', async () => {
        const response = await supertest(app.server)
            .get('/user/friends')
            .set('Cookie', `access_token=${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true); // if expecting an array
    });

});
