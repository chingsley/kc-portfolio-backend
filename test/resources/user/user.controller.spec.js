import supertest from 'supertest';
import bcrypt from 'bcryptjs';

import db from '../../../src/database/models';

import server from '../../../src/server';

import { sampleUsers } from '../../data.samples/users.samples';
import UserController from '../../../src/resources/user/user.controller';

const app = supertest(server.server);

describe('UserController', () => {
  beforeAll(async () => {
    await db.User.destroy({ where: {}, truncate: { cascade: true } });
  });

  describe('registerUser', () => {
    let res, user;
    beforeAll(async () => {
      res = await app.post('/api/v1/users').send(sampleUsers[0]);
      const { email } = sampleUsers[0];
      user = await db.User.findOne({
        where: { email },
      });
    });
    describe('try', () => {
      it('creates a new user in the database', async (done) => {
        try {
          const { firstName, lastName, email, username } = sampleUsers[0];

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
          const { firstName, lastName, email, username } = sampleUsers[0];
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
          const { password } = sampleUsers[0];
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
            .send({ ...sampleUsers[1], email: sampleUsers[0].email });
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
            .send({ ...sampleUsers[1], username: sampleUsers[0].username });
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
});
