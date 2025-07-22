import app from '../src/app';
import supertest from 'supertest';

///TODO : mock api with invalid body 

describe('Block API: basic testing', () => {
    let token: string;
    const testUser = { id: 1, username: 'hicham' };
    const otherUser = { id: 12, username: 'user12' };
    const blockedUser = {id: 4, username: 'user4'};

    beforeAll(async () => {
        await app.ready();
        token = app.jwt.sign({
            id: testUser.id,
            username: testUser.username,
        });
    });

    it('should block a user', async () => {
        const response = await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: otherUser.id, action: true });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'user has been blocked' });
    });

    it('should unblock a user', async () => {
        // First, block the user
        const _response = await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: otherUser.id, action: true });

        expect(_response.status).toBe(400);
        expect(_response.body).toEqual({ message: "you have already blocked this user" });



        // Then, unblock the user
        const response = await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: otherUser.id, action: false });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'user has been unblocked' });
    });

    it('should not allow a user to block someone who is already blocked', async () => {
        // Ensure the user is blocked first
        await supertest(app.server)
        .post('/user/block')
        .set('Cookie', `access_token=${token}`)
        .send({ user_id: blockedUser.id, action: true });


        const response = await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: blockedUser.id, action: true });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'you have already blocked this user' });
    });

    it('should not allow a user to unblock someone who is not blocked', async () => {
        const response = await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: otherUser.id, action: false });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'user is not blocked' });
    });

    it('should return 404 if the user to block does not exist', async () => {
        const response = await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: 9999, action: true });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'user does not exists' });
    });
});

describe('Block API: Testing with friend and request', () => {
    let token: string;
    const testUser = { id: 1, username: 'hicham' };
    const friend = { id: 2, username: 'jebli' };

    beforeAll(async () => {
        await app.ready();
        token = app.jwt.sign({
            id: testUser.id,
            username: testUser.username,
        });
    });


    it('should return 200 when block a friend and should delete friendship ', async () => {
        const response = await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: friend.id, action: true });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'user has been blocked' });

        const user_relations_status = await supertest(app.server)
            .get(`/user/${friend.id}`)
            .set('Cookie', `access_token=${token}`)

        expect(user_relations_status.status).toBe(200);
        expect(user_relations_status.body.relation_status).toEqual('blocking');
    });


    it('should return 200 when unblock a friend and should delete friendship ', async () => {
        const response = await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: friend.id, action: false });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'user has been unblocked' });

        const user_response = await supertest(app.server)
            .get(`/user/${friend.id}`)
            .set('Cookie', `access_token=${token}`)

        expect(user_response.status).toBe(200);
        expect(user_response.body.relation_status).toEqual('none');
    });

    it('should return 200 when block a pending request and should delete request ', async () => {
        // First, send a friend request to the friend
        const friend_request = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: friend.id, type: 'friend' });


        expect(friend_request.status).toBe(200);
        expect(friend_request.body).toEqual({ message: 'friend request sent' });

        const response = await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: friend.id, action: true });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'user has been blocked' });

        const userResponse = await supertest(app.server)
            .get(`/user/${friend.id}`)
            .set('Cookie', `access_token=${token}`)

        expect(userResponse.status).toBe(200);
        expect(userResponse.body.relation_status).toEqual('blocking');

        const unblock_response = await supertest(app.server)
            .post('/user/block')
            .set('Cookie', `access_token=${token}`)
            .send({ user_id: friend.id, action: false });

        expect(unblock_response.status).toBe(200);
        expect(unblock_response.body).toEqual({ message: 'user has been unblocked' });

        const user_response = await supertest(app.server)
            .get(`/user/${friend.id}`)
            .set('Cookie', `access_token=${token}`)

        expect(user_response.status).toBe(200);
        expect(user_response.body.relation_status).toEqual('none');
    });


})
