import supertest from 'supertest';
import bcrypt from 'bcryptjs';

import { v2 as cloudinary } from 'cloudinary';

import db from '../../src/database/models';

import server from '../../src/server';

import { sampleUsers, sampleUserImage } from './user.testSamples';
import UserController from '../../src/resources/user/user.controller';
import UserTestHelper from './user.testHelper';

const app = supertest(server.server);

const userHelper = new UserTestHelper();

describe('UserController', () => {
  describe('registerUser', () => {
    let res,
      user,
      sampleUser = sampleUsers[1];
    beforeAll(async () => {
      const originalImplementation = cloudinary.uploader.upload;
      cloudinary.uploader.upload = jest
        .fn()
        .mockReturnValue({ url: sampleUserImage });
      await userHelper.resetDB([db.User]);
      const { firstName, lastName, username, email, password } = sampleUser;
      const imageFile = `${process.cwd()}/test/testData/img.sample.jpg`;
      res = await app
        .post('/api/v1/users')
        .field('firstName', firstName)
        .field('lastName', lastName)
        .field('username', username)
        .field('email', email)
        .field('password', password)
        .attach('image', imageFile);
      cloudinary.uploader.upload = originalImplementation;
      user = await db.User.findOne({
        where: { email: sampleUser.email },
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
      it('can upload image to cloudinary', async (done) => {
        try {
          expect(res.body.data.user.image).toBe(sampleUserImage);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns the user data in response body', async (done) => {
        try {
          const { firstName, lastName, email, username } = sampleUser;
          const {
            data: { user },
          } = res.body;
          expect(user).toEqual(
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
      it('catches errors in the catch block', async (done) => {
        try {
          const originalImplementation = db.User.create;
          db.User.create = jest.fn().mockImplementation(() => {
            throw new Error('bummer');
          });
          const res = await app.post('/api/v1/users').send(sampleUsers[0]);
          db.User.create = originalImplementation;
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty('error', 'bummer');
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('getAllUsers', () => {
    let res;
    beforeAll(async () => {
      await userHelper.resetDB();
      await userHelper.createBulkUsers();
      res = await app.get('/api/v1/users');
    });
    describe('try', () => {
      it('returns 200 OK on successful fetch', async (done) => {
        try {
          expect(res.status).toBe(200);
          expect(res.body.data.count).toEqual(sampleUsers.length);
          expect(res.body.data.rows).toHaveLength(sampleUsers.length);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns array of all inserted element with a count property', async (done) => {
        try {
          expect(res.body.data.count).toEqual(sampleUsers.length);
          expect(res.body.data.rows).toHaveLength(sampleUsers.length);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('can paginates the result', async (done) => {
        try {
          const pageSize = 1;
          const res = await app.get(
            `/api/v1/users?pageSize=${pageSize}&page=0`
          );
          expect(res.body.data.count).toEqual(sampleUsers.length);
          expect(res.body.data.rows).toHaveLength(pageSize);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('can filter the result by firstName', async (done) => {
        try {
          const firstNameLike = 'king';
          const res = await app.get(`/api/v1/users?firstName=${firstNameLike}`);
          for (let user of res.body.data.rows) {
            expect(user.firstName).toMatch(firstNameLike);
          }
          done();
        } catch (e) {
          done(e);
        }
      });
      it('can filter the result by lastName', async (done) => {
        try {
          const lastNameLike = 'sn';
          const res = await app.get(`/api/v1/users?lastName=${lastNameLike}`);
          for (let user of res.body.data.rows) {
            expect(user.lastName).toMatch(lastNameLike);
          }
          done();
        } catch (e) {
          done(e);
        }
      });
      it('can filter the result by username', async (done) => {
        try {
          const usernameLike = 'ene';
          const res = await app.get(`/api/v1/users?username=${usernameLike}`);
          for (let user of res.body.data.rows) {
            expect(user.username).toMatch(usernameLike);
          }
          done();
        } catch (e) {
          done(e);
        }
      });
      it('can filter the result by email', async (done) => {
        try {
          const emailLike = 'arya';
          const res = await app.get(`/api/v1/users?email=${emailLike}`);
          for (let user of res.body.data.rows) {
            expect(user.email).toMatch(emailLike);
          }
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('catches error in the catch block', async (done) => {
        try {
          const req = { query: {} };
          const res = { body: {} };
          const next = jest.fn();
          const originalImplementation = db.User.findAndCountAll;
          db.User.findAndCountAll = jest.fn().mockImplementation(() => {
            throw new Error('bummer');
          });
          UserController.getAllUsers(req, res, next);
          db.User.findAndCountAll = originalImplementation;
          expect(next).toHaveBeenCalled();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('loginUser', () => {
    let user;
    beforeAll(async () => {
      await userHelper.resetDB();
      user = await userHelper.createUser({
        user: sampleUsers[0],
        role: 'user',
      });
    });

    it('logs in a user with valid email and password', async (done) => {
      try {
        const res = await app.post('/api/v1/users/login').send({
          email: user.email,
          password: sampleUsers[0].password,
        });
        const { data } = res.body;
        expect(res.status).toBe(200);
        expect(data.user).toEqual(
          expect.objectContaining({
            id: user.id,
            uuid: user.uuid,
            email: user.email,
            username: user.username,
          })
        );
        expect(data).toHaveProperty('token');
        done();
      } catch (e) {
        done(e);
      }
    });
    it('logs in a user with valid username and password', async (done) => {
      try {
        const res = await app.post('/api/v1/users/login').send({
          username: user.username,
          password: sampleUsers[0].password,
        });
        const { data } = res.body;
        expect(res.status).toBe(200);
        expect(data.user).toEqual(
          expect.objectContaining({
            id: user.id,
            uuid: user.uuid,
            email: user.email,
            username: user.username,
          })
        );
        expect(data).toHaveProperty('token');
        done();
      } catch (e) {
        done(e);
      }
    });
    it('returns status 401 if email/username not found', async (done) => {
      try {
        const res = await app.post('/api/v1/users/login').send({
          username: user.username + 'invalid',
          password: sampleUsers[0].password,
        });
        const expectedError = 'Login failed. Invalid credentials.';
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error', expectedError);
        done();
      } catch (e) {
        done(e);
      }
    });
    it('returns status 401 if password is incorrect', async (done) => {
      try {
        const res = await app.post('/api/v1/users/login').send({
          username: user.username,
          password: sampleUsers[0].password + 'invalid',
        });
        const expectedError = 'Login failed. Invalid credentials.';
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error', expectedError);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
