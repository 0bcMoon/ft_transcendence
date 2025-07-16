import app from '../src/app';
import supertest from 'supertest';

describe('GET /users', () => {
    let token: string;
    const testUser = {
        id: 1,
        username: 'hicham',
    };

    beforeAll(async () => {
        await app.ready();
        // Generate a token
        console.log('Generating token for test user', process.env.DB_PATH);
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
    const otherUser = { id: 12, username: 'user12' };

    beforeAll(async () => {
        await app.ready();
        token = app.jwt.sign({
            id: testUser.id,
            username: testUser.username,
        });
    });

    it(`should send a friend request to users `, async () => {
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

    it('should not allow to delete a non existing request', async () => {
        const response = await supertest(app.server)
            .delete('/user/requests/9999') // Assuming 9999 is a non-existent request ID
            .set('Cookie', `access_token=${token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'no friends request found' });
    });

    it('should delete (cancal) a friend request', async () => {

        // Step 2: Get the list of sent requests to find the request ID.
        const getRequestsResponse = await supertest(app.server)
            .get('/user/requests')
            .query({ type: 'friend' })
            .set('Cookie', `access_token=${token}`);

        expect(getRequestsResponse.status).toBe(200);
        expect(Array.isArray(getRequestsResponse.body)).toBe(true);

        const sentRequests = getRequestsResponse.body;
        const requestToDelete = sentRequests.find((req: { id: number; }) => req.id === otherUser.id);

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

});

describe('Friend Requests API - Accepting Requests', () => {

    let token: string;
    let accepteToken: string;
    let denyToken: string;

    const testUser = { id: 1, username: 'hicham' };
    const accepteUser = { id: 12, username: 'user12' };
    const denyUser = { id: 13, username: 'user13' };

    beforeAll(async () => {
        await app.ready();


        denyToken = app.jwt.sign({
            id: denyUser.id,
            username: denyUser.username,
        });

        accepteToken = app.jwt.sign({
            id: accepteUser.id,
            username: accepteUser.username,
        });

        token = app.jwt.sign({
            id: testUser.id,
            username: testUser.username,
        });
    });


    it(`should send a friend request to users `, async () => {
        const response = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ userId: accepteUser.id, type: 'friend' });

        expect(response.body).toEqual({ message: 'friend request sent' });
    });


    it('should return a list of pending request', async () => {
        const response = await supertest(app.server)
            .get('/user/requests')
            .query({ type: 'friend' })
            .set('Cookie', `access_token=${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].id).toBe(accepteUser.id);
        expect(response.body[0].request_type).toBe("sent");
    });



    it('should allow a user to accept a friend request', async () => {

        // get Users 1 (hicham) requests for list
        const response = await supertest(app.server)
            .get('/user/requests')
            .query({ type: 'friend' })
            .set('Cookie', `access_token=${accepteToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].id).toBe(testUser.id);
        expect(response.body[0].request_type).toBe("received");


        const request = response.body.find((r: any) => r.id === testUser.id);
        expect(request).toBeDefined();
        const reqId = request.req_id;


        // User 2 (user12) accepts the request
        const acceptResponse = await supertest(app.server)
            .patch('/user/requests')
            .set('Cookie', `access_token=${accepteToken}`) // token for user 2
            .send({ reqId: reqId, otherUserId: testUser.id ,type: 'friend', action: true });
        expect(acceptResponse.status).toBe(200);
        expect(acceptResponse.body).toEqual({ message: 'friends request has been accepted' });
        // Check if the relation status is now 'friend'
        const checkResponse = await supertest(app.server)
            .get(`/user/${testUser.id}`)
            .set('Cookie', `access_token=${accepteToken}`);
        expect(checkResponse.status).toBe(200);
        expect(checkResponse.body.relation_status).toEqual('friend');
    })


    it(`should send a friend request to users `, async () => {
        const response = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ userId: denyUser.id, type: 'friend' });

        expect(response.body).toEqual({ message: 'friend request sent' });
    });

    it('should allow a user to deny a friend request', async () => {

        // get Users 1 (hicham) requests fro list
        const response = await supertest(app.server)
            .get('/user/requests')
            .query({ type: 'friend' })
            .set('Cookie', `access_token=${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].id).toBe(denyUser.id);
        expect(response.body[0].request_type).toBe("sent");


        const request = response.body.find((r: any) => r.id === denyUser.id);
        expect(request).toBeDefined();
        const reqId = request.req_id;


        // User 3 (user13) deny the request
        const denyResponse = await supertest(app.server)
            .patch('/user/requests')
            .set('Cookie', `access_token=${denyToken}`) // token for user 2
            .send({ reqId: reqId,  type: 'friend', action: false });

        console.log(request);
        expect(denyResponse.status).toBe(200);
        expect(denyResponse.body).toEqual({ message: 'friends request has been deleted' });
        // Check if the relation status is now 'none'
        const checkResponse = await supertest(app.server)
            .get(`/user/${testUser.id}`)
            .set('Cookie', `access_token=${denyToken}`);
        expect(checkResponse.status).toBe(200);
        expect(checkResponse.body.relation_status).toEqual('none');
    })

    it('should return 404 when trying to accept a non-existent request', async () => {
        const response = await supertest(app.server)
            .patch('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ reqId: 9999, type: 'friend', action: true });
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'no friends request found' });
    });

})
