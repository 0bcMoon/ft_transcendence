import app from '../src/app';
import supertest from 'supertest';
import { execSync } from 'child_process';
import { abort } from 'process';

describe('GET /users', () => {
    let token: string;
    let userId: number;
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

    it('should return a list of friend with a valid token in a cookie', async () => {
        const response = await supertest(app.server)
            .get('/user/friends')
            .set('Cookie', `access_token=${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
    });

});

describe('Friend Requests API', () => {
    let token: string;
    const testUser = { id: 1, username: 'hicham' };
    const friend = { id: 2 };
    const blocked = { id: 4 };
    const otherUser = { id: 12 };
    const anotherUser = { id: 13 };

    beforeAll(async () => {
        await app.ready();
        token = app.jwt.sign({
            id: testUser.id,
            username: testUser.username,
        });
    });

    it('should send a friend request', async () => {
        const response = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ userId: otherUser.id, type: 'friend' });

        expect(response.body).toEqual({ message: 'friend request sent' });
    });


    it('relations status should be friend', async () => {
        const response = await supertest(app.server)
            .get(`/user/${friend.id}`)
            .set('Cookie', `access_token=${token}`)

        expect(response.status).toBe(200);
        expect(response.body.relation_status).toEqual('friend');

    });

    it('relations status should be pending', async () => {
        const response = await supertest(app.server)
            .get(`/user/${otherUser.id}`)
            .set('Cookie', `access_token=${token}`)

        expect(response.status).toBe(200);
        expect(response.body.relation_status).toEqual('pending');

    });

    it('should not allow a user to send a friend request to themselves', async () => {
        const response = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ userId: testUser.id, type: 'friend' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'you cannot send friend request to yourself' });

    });

    it('should not allow a user to send a friend request to existing friend', async () => {
        const response = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ userId: friend.id, type: 'friend' });

        console.log(response.body);
        

        
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "you are already friends" });

    });

    it('should not allow a user to send a friend request to blocked users', async () => {
        const response = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ userId: blocked.id, type: 'friend' });

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: "you are blocked by this user" });

    });

    it('should not allow a user to send a friend request to non existing user', async () => {
        const response = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ userId: 9999, type: 'friend' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'user does not exists' });

    });

    it('should not send request to non existing users', async () => {
        const response = await supertest(app.server)
            .delete('/user/requests/9999') // Assuming 9999 is a non-existent request ID
            .set('Cookie', `access_token=${token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'no friends request found' });
    });

    it('should delete a friend request', async () => {
        // Step 1: Send a friend request to have something to delete.
        const createResponse = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ userId: anotherUser.id, type: 'friend' });

        expect(createResponse.status).toBe(200);

        // Step 2: Get the list of sent requests to find the request ID.
        const getRequestsResponse = await supertest(app.server)
            .get('/user/requests?type=friend')
            .set('Cookie', `access_token=${token}`);

        expect(getRequestsResponse.status).toBe(200);
        expect(Array.isArray(getRequestsResponse.body)).toBe(true);

        const sentRequests = getRequestsResponse.body;
        const requestToDelete = sentRequests.find((req: { id: number; }) => req.id === anotherUser.id);

        expect(requestToDelete).toBeDefined();
        const reqId = requestToDelete.req_id;

        // Step 3: Delete the request.
        const deleteResponse = await supertest(app.server)
            .delete(`/user/requests/${reqId}`)
            .set('Cookie', `access_token=${token}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body).toEqual({ message: 'friends request has been deleted' });

    });

    it('should return 404 when trying to delete a non-existent request', async () => {
        const response = await supertest(app.server)
            .delete('/user/requests/9999') // Assuming 9999 is a non-existent request ID
            .set('Cookie', `access_token=${token}`);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'no friends request found' });
    });


    it('should send a friend request', async () => {
        const response = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ userId: otherUser.id, type: 'friend' });
        expect(response.body).toEqual({ message: 'friend request sent' });
    });

    it('should get all pending requests', async () => {
        const response = await supertest(app.server)
            .get('/user/requests&type=friend')
            .set('Cookie', `access_token=${token}`)
            .send();

        console.log(response.body);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        expect(response.body.length).toBeGreaterThan(0); // Assuming there are pending requests

    });

    // it('should allow a user to accept a friend request', async () => {
    //     // User 15 sends a friend request to User 1 (hicham)
    //
    //     // User 1 (hicham) needs to find the request ID.
    //     // We fetch it from the sender's point of view since we can't get received requests.
    //
    //     // User 1 (hicham) accepts the request
    //     const response = await supertest(app.server)
    //         .patch('/user/requests')
    //         .set('Cookie', `access_token=${token}`) // token for user 1
    //         .send({ reqId: reqId, type: 'friend', action: true });
    //
    //     expect(response.status).toBe(200);
    //     expect(response.body).toEqual({ message: 'friends request has been accepted' });
    // });

    it('should allow a user to deny a friend request', async () => {
        // User 16 sends a friend request to User 1 (hicham)
        const requesterToken = app.jwt.sign({ id: 16, username: 'user16' });
        await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${requesterToken}`)
            .send({ userId: testUser.id, type: 'friend' });

        // User 1 (hicham) needs to find the request ID.
        const getRequestsResponse = await supertest(app.server)
            .get('/user/requests?type=friend')
            .set('Cookie', `access_token=${requesterToken}`);

        const request = getRequestsResponse.body.find((r: any) => r.id === testUser.id);
        expect(request).toBeDefined();
        const reqId = request.req_id;

        // User 1 (hicham) denies the request
        const response = await supertest(app.server)
            .patch('/user/requests')
            .set('Cookie', `access_token=${token}`) // token for user 1
            .send({ reqId: reqId, type: 'friend', action: false });
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'friends request has been deleted' });
    });

    it('should return 404 when trying to accept a non-existent request', async () => {
        const response = await supertest(app.server)
            .patch('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ reqId: 9999, type: 'friend', action: true });
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'no friends request found' });
    });


});

