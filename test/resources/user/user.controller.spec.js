import supertest from 'supertest';
import db from '../../../src/database/models';

import server from '../../../src/server';

const app = supertest(server.server);

describe('UserController', () => {
  beforeAll(async () => {
    await db.User.destroy({ where: {}, truncate: { cascade: true } });
  });

  describe('registerUser', () => {
    describe('try', () => {
      it('registers a new user', async (done) => {
        try {
          const res = await app.post('/api/v1/users').send({
            email: 'eneja.kc3@gmail.com',
            username: 'chingsley2',
            password: 'Santo*59Domin90',
            firstName: 'kingsley',
            lastName: 'eneja',
          });
          // console.log(res.body);
          expect(res.status).toBe(201);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
