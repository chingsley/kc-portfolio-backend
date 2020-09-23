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
        .post('/api/v1/users/request_password_reset')
        .send({ email: user.email });
      sgMail.send = originalImplementation;
      resetToken = await authHelper.getUserPasswordResetToken(user.email);
    });
    it('returns 200 upon successful validation', async (done) => {
      try {
        const res = await app
          .get('/api/v1/auth/password/validate_reset_token')
          .set('token', resetToken);
        expect(res.status).toBe(200);
        done();
      } catch (e) {
        done(e);
      }
    });
    it('returns status 400 with errorCode PRT002 if the reset token is not found', async (done) => {
      try {
        const res = await app
          .get('/api/v1/auth/password/validate_reset_token')
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
          .get('/api/v1/auth/password/validate_reset_token')
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
