// testGame.test.ts
import app from '../src/app';
import supertest from 'supertest';

describe('POST /api/tournaments/:id/register', () => {
    let token: string;
    const testUser = { id: 1, username: 'hicham' };
    const validTournamentId = 1;      // Use a real tournament ID from your test DB
    const fullTournamentId = 2;       // Tournament that is already full
    const closedTournamentId = 3;     // Tournament with registration closed
    const notFoundTournamentId = 999; // Non-existent tournament

    beforeAll(async () => {
        await app.ready();

        // Sign JWT for test user
        token = app.jwt.sign({
            id: testUser.id,
            username: testUser.username,
        });
    });

    it('should register successfully if tournament is open', async () => {
        const res = await supertest(app.server)
            .post(`/api/tournaments/${validTournamentId}/register`)
            .set('Cookie', `access_token=${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
    });

    it('should return 400 if already registered', async () => {
        const res = await supertest(app.server)
            .post(`/api/tournaments/${validTournamentId}/register`)
            .set('Cookie', `access_token=${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Already registered');
    });

    it('should return 400 if tournament is full', async () => {
        const res = await supertest(app.server)
            .post(`/api/tournaments/${fullTournamentId}/register`)
            .set('Cookie', `access_token=${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Tournament is full');
    });

    it('should return 403 if registration is closed', async () => {
        const res = await supertest(app.server)
            .post(`/api/tournaments/${closedTournamentId}/register`)
            .set('Cookie', `access_token=${token}`);

        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Registration closed');
    });

    it('should return 404 if tournament does not exist', async () => {
        const res = await supertest(app.server)
            .post(`/api/tournaments/${notFoundTournamentId}/register`)
            .set('Cookie', `access_token=${token}`);

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Tournament not found');
    });

    it('should return 401 if no token is provided', async () => {
        const res = await supertest(app.server)
            .post(`/api/tournaments/${validTournamentId}/register`);

        expect(res.status).toBe(401); // or 403 depending on your auth config
    });
});

