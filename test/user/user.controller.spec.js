import supertest from 'supertest';
import bcrypt from 'bcryptjs';

import db from '../../src/database/models';

import server from '../../src/server';

import { sampleUsers } from './userTest.samples';
import UserController from '../../src/resources/user/user.controller';
import UserTestHelper from './UserTest.helper';

const app = supertest(server.server);

const helper = new UserTestHelper();

describe('UserController', () => {
  beforeAll(async () => {
    await helper.resetDB([db.User]);
  });

  describe('registerUser', () => {
    let res,
      user,
      sampleUser = sampleUsers[1];
    beforeAll(async () => {
      res = await app.post('/api/v1/users').send(sampleUser);
      const { email } = sampleUser;
      user = await db.User.findOne({
        where: { email },
      });
    });
    describe('try', () => {
      it('creates a new user in the database', async (done) => {
        try {
          const { firstName, lastName, email, username } = sampleUser;

          expect(user.dataValues).toEqual(
            expect.objectContaining({
              firstName,
              lastName,
              email,
              username,
            })
          );
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns status code 201 with a success message', async (done) => {
        try {
          expect(res.status).toBe(201);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns the user data in response body', async (done) => {
        try {
          const { firstName, lastName, email, username } = sampleUser;
          const { data } = res.body;
          expect(data).toEqual(
            expect.objectContaining({
              firstName,
              lastName,
              email,
              username,
            })
          );
          done();
        } catch (e) {
          done(e);
        }
      });
      it('sets "isVerified" to false for the newly created user', async (done) => {
        try {
          expect(user.isVerified).toBe(false);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('it correctly hashes the user password', async (done) => {
        try {
          const { password } = sampleUser;
          const isValidPassword = bcrypt.compareSync(password, user.password);
          expect(isValidPassword).toBe(true);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 409 error for duplicate email', async (done) => {
        try {
          const res = await app
            .post('/api/v1/users')
            .send({ ...sampleUsers[1], email: sampleUser.email });
          expect(res.status).toBe(409);
          expect(res.body).toHaveProperty('error');
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 409 error for duplicate username', async (done) => {
        try {
          const res = await app
            .post('/api/v1/users')
            .send({ ...sampleUsers[1], username: sampleUser.username });
          expect(res.status).toBe(409);
          expect(res.body).toHaveProperty('error');
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('catches errors in the catch block', () => {
        const req = undefined;
        const res = { body: {} };
        const next = jest.fn();
        UserController.registerUser(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });
  });
  describe('getAllUsers', () => {
    beforeAll(async () => {
      await helper.resetDB();
      await helper.createBulkUsers();
    });
    describe('try', () => {
      it('returns 200 OK on successful fetch', async (done) => {
        try {
          const res = await app.get('/api/v1/users');
          expect(res.status).toBe(200);
          expect(res.body.data.count).toEqual(sampleUsers.length);
          expect(res.body.data.rows).toHaveLength(sampleUsers.length);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
