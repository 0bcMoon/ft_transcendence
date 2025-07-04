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
    const otherUser = { id: 2 };
    const anotherUser = { id: 3 };

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

        console.log({ userId: otherUser.id, type: 'friend' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'friend request sent' });

    });

    it('should not allow a user to send a friend request to themselves', async () => {
        const response = await supertest(app.server)
            .post('/user/requests')
            .set('Cookie', `access_token=${token}`)
            .send({ userId: testUser.id, type: 'friend' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'you cannot send friend request to yourself' });
    });

    it('should not send request to existing friend', async () => {
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


});
