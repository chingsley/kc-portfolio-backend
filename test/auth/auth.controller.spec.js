import supertest from 'supertest';
const sgMail = require('@sendgrid/mail');

import db from '../../src/database/models';

import server from '../../src/server';

import { sampleUsers } from '../user/user.testSamples';
import UserTestHelper from '../user/user.testHelper';
import AuthTestHelper from './auth.testHelper';
import { yesterday } from '../app/app.testHelper';

const app = supertest(server.server);

const userHelper = new UserTestHelper();
const authHelper = new AuthTestHelper();

describe('authController', () => {
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
        const res = await app.post('/api/v1/auth/login').send({
          email: user.email,
          password: sampleUsers[0].password,
        });
        // console.log(res.body)
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
        const res = await app.post('/api/v1/auth/login').send({
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
        const res = await app.post('/api/v1/auth/login').send({
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
        const res = await app.post('/api/v1/auth/login').send({
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

  describe('requestPasswordReset', () => {
    let res,
      email = sampleUsers[0].email;
    beforeAll(async () => {
      await userHelper.resetDB([db.User, db.Role]);
      await userHelper.createUser({
        user: sampleUsers[0],
        role: 'user',
      });
      const originalImplementation = sgMail.send;
      sgMail.send = jest.fn().mockImplementation(() => true);
      res = await app
        .post('/api/v1/auth/request_password_reset')
        .send({ email });
      sgMail.send = originalImplementation;
    });

    it('returns 200 on successful response', async (done) => {
      try {
        expect(res.status).toBe(200);
        done();
      } catch (e) {
        done(e);
      }
    });
    it('returns a message asking the user to check their mail for reset instructions', async (done) => {
      try {
        const message = `Please check your inbox ${email} for password reset instructions.`;
        expect(res.body).toHaveProperty('message', message);
        done();
      } catch (e) {
        done(e);
      }
    });
    it('cacthes errors thrown in the try block', async (done) => {
      try {
        const originalImplementation = db.User.findOne;
        const error = 'bummer!';
        db.User.findOne = jest.fn().mockImplementation(() => {
          throw new Error(error);
        });
        const res = await app
          .post('/api/v1/auth/request_password_reset')
          .send({ email: 'user@gmail.com' });
        db.User.findOne = originalImplementation;
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error', error);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  describe('validatePasswordResetToken', () => {
    let user,
      resetToken,
      sampleUser = sampleUsers[0];
    beforeAll(async () => {
      await userHelper.resetDB([db.User]);
      user = await userHelper.createUser({ user: sampleUser, role: 'user' });
      const originalImplementation = sgMail.send;
      sgMail.send = jest.fn().mockImplementation(() => true);
      await app
        .post('/api/v1/auth/request_password_reset')
        .send({ email: user.email });
      sgMail.send = originalImplementation;
      resetToken = await authHelper.getUserPasswordResetToken(user.email);
    });
    it('returns 200 upon successful validation', async (done) => {
      try {
        const res = await app
          .get('/api/v1/auth/validate_password_reset_token')
          .set('token', resetToken);
        expect(res.status).toBe(200);
        done();
      } catch (e) {
        done(e);
      }
    });

    it('returns status 400 with errorCode PRT001 if the token is not a valid uuid', async (done) => {
      try {
        const res = await app
          .get('/api/v1/auth/validate_password_reset_token')
          .set('token', 'INVALID-UUID-VALUE');
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'invalid token');
        expect(res.body).toHaveProperty('errorCode', 'PRT001');
        done();
      } catch (e) {
        done(e);
      }
    });

    it('returns status 400 with errorCode PRT002 if the reset token is not found', async (done) => {
      try {
        const res = await app
          .get('/api/v1/auth/validate_password_reset_token')
          .set('token', `404${resetToken.slice(3)}`);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'invalid token');
        expect(res.body).toHaveProperty('errorCode', 'PRT002');
        done();
      } catch (e) {
        done(e);
      }
    });
    it('returns status 400 with errorCode PRT003 if the reset token is expired', async (done) => {
      try {
        await authHelper.updatePasswordResetToken(resetToken, {
          expires: yesterday,
        });
        const res = await app
          .get('/api/v1/auth/validate_password_reset_token')
          .set('token', resetToken);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'invalid token');
        expect(res.body).toHaveProperty('errorCode', 'PRT003');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
