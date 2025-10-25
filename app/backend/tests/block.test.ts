import app from '../src/app';
import supertest from 'supertest';

describe('GET /user/block API', () => {
    let token: string;
    const testUser = { id: 1, username: 'hicham' };
    const userToBlock1 = { id: 16, username: 'user16' };
    const userToBlock2 = { id: 17, username: 'user17' };

    beforeAll(async () => {
        await app.ready();
        token = app.jwt.sign({
            id: testUser.id,
            username: testUser.username,
        });
    });

    it('should correctly list blocked users and reflect blocking and unblocking actions', async () => {
        // To ensure a clean state, first unblock the users we will test with.
        // This might return 400 if they are not blocked, which we can ignore for setup.
        await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: userToBlock1.id, action: false })
            .ok(res => res.status === 200 || res.status === 400);

        await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: userToBlock2.id, action: false })
            .ok(res => res.status === 200 || res.status === 400);

        // 1. Initially, our test users should not be in the blocked list.
        let getResponse = await supertest(app.server)
            .get('/user/block')
            .set('Cookie', `access_token=${token}`);
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.find((u: any) => u.id === userToBlock1.id)).toBeUndefined();
        expect(getResponse.body.find((u: any) => u.id === userToBlock2.id)).toBeUndefined();

        // 2. Block one user and check if they appear in the list.
        await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: userToBlock1.id, action: true });
        
        getResponse = await supertest(app.server)
            .get('/user/block')
            .set('Cookie', `access_token=${token}`);
        expect(getResponse.body.find((u: any) => u.id === userToBlock1.id)).toBeDefined();

        // 3. Block a second user and check for both.
        await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: userToBlock2.id, action: true });

        getResponse = await supertest(app.server)
            .get('/user/block')
            .set('Cookie', `access_token=${token}`);
        expect(getResponse.body.find((u: any) => u.id === userToBlock1.id)).toBeDefined();
        expect(getResponse.body.find((u: any) => u.id === userToBlock2.id)).toBeDefined();

        // 4. Unblock one user and check they are removed from the list.
        await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: userToBlock1.id, action: false });

        getResponse = await supertest(app.server)
            .get('/user/block')
            .set('Cookie', `access_token=${token}`);
        expect(getResponse.body.find((u: any) => u.id === userToBlock1.id)).toBeUndefined();
        expect(getResponse.body.find((u: any) => u.id === userToBlock2.id)).toBeDefined();

        // 5. Cleanup: Unblock the second user.
        await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: userToBlock2.id, action: false });
    });
});
