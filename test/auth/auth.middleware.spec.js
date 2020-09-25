import supertest from 'supertest';
import Joi from '@hapi/joi';
import { v4 as uuidv4 } from 'uuid';

import server from '../../src/server';
import { sampleUsers } from '../user/user.testSamples';

const app = supertest(server.server);

describe('authMiddleware', () => {
  const testCatchBlock = (method, url, payload) => {
    it('catches errors thrown in the try block', async (done) => {
      try {
        const originalImplementation = Joi.object;
        const sampleError = 'let"s pretend something went wrong';
        Joi.object = jest.fn().mockImplementation(() => {
          throw new Error(sampleError);
        });
        const res = await app[method](url).send(payload);
        Joi.object = originalImplementation;
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error', sampleError);
        done();
      } catch (e) {
        done(e);
      }
    });
  };
  describe('validateLoginDetails', () => {
    it('returns 400 if email and username are not provided', async (done) => {
      try {
        const res = await app.post('/api/v1/auth/login').send({
          password: 'user_password',
        });
        const expectedError =
          '"value" must contain at least one of [email, username]';
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', expectedError);
        done();
      } catch (e) {
        done(e);
      }
    });
    it('returns 400 if password is not provided', async (done) => {
      try {
        const res = await app.post('/api/v1/auth/login').send({
          email: 'user_email',
        });
        const expectedError = '"password" is required';
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', expectedError);
        done();
      } catch (e) {
        done(e);
      }
    });
    it('detects unknown fields', async (done) => {
      try {
        const res = await app.post('/api/v1/users').send({
          ...sampleUsers[0],
          maritalStatus: 'single',
        });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty(
          'error',
          '"maritalStatus" is not allowed'
        );
        done();
      } catch (e) {
        done(e);
      }
    });
    it('enforces strong password', async (done) => {
      try {
        const res = await app.post('/api/v1/users').send({
          ...sampleUsers[0],
          password: 'testing',
        });
        expect(res.status).toBe(400);
        const errorMsg =
          'password must be a minimum of 8 characters long, must contain a lowercase, an uppercase, a number and a special character';
        expect(res.body).toHaveProperty('error', errorMsg);
        done();
      } catch (e) {
        done(e);
      }
    });
    it('enforces a defined format for username', async (done) => {
      try {
        const res = await app.post('/api/v1/users').send({
          ...sampleUsers[0],
          username: 'ching/sley',
        });
        expect(res.status).toBe(400);
        const errorMsg =
          'invalid username. Username can only consist of lowercase letters, numbers, a dash and/or an underscore';
        expect(res.body).toHaveProperty('error', errorMsg);
        done();
      } catch (e) {
        done(e);
      }
    });
    testCatchBlock('post', '/api/v1/auth/login', {
      email: 'user_email',
      password: 'user_password',
    });
  });

  describe('validatePasswordResetDetails', () => {
    it('returns 400 for unqualified password', async (done) => {
      try {
        const res = await app
          .patch(`/api/v1/auth/password/${uuidv4()}`)
          .send({ password: 'test' });
        const errorMsg =
          'password must be a minimum of 8 characters long, must contain a lowercase, an uppercase, a number and a special character';
        expect(res.body).toHaveProperty('error', errorMsg);
        done();
      } catch (e) {
        done(e);
      }
    });
    it('returns 400 for invalid uuid reset token', async (done) => {
      try {
        const res = await app
          .patch(`/api/v1/auth/password/invalid-${uuidv4()}`)
          .send({ password: 'Testing*123' });
        const errorMsg = '"resetToken" must be a valid GUID';
        expect(res.body).toHaveProperty('error', errorMsg);
        done();
      } catch (e) {
        done(e);
      }
    });
    testCatchBlock('patch', `/api/v1/auth/password/${uuidv4()}`, {
      password: 'Testing*123',
    });
  });
});
