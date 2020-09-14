import supertest from 'supertest';
import Joi from '@hapi/joi';

import server from '../../src/server';
import { sampleUsers } from './user.testSamples';

const app = supertest(server.server);

describe('UserMiddleware', () => {
  describe('validateNewUser', () => {
    describe('try', () => {
      it('detects missing fields', async (done) => {
        try {
          const requiredFields = ['email', 'username', 'password'];
          for (let field of requiredFields) {
            const res = await app.post('/api/v1/users').send({
              ...sampleUsers[0],
              [field]: undefined,
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', `"${field}" is required`);
          }
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
    });
    describe('catch', () => {
      it('catches errors thrown in the try block', async (done) => {
        try {
          const originalImplementation = Joi.object;
          const sampleError = 'let"s pretend something went wrong';
          Joi.object = jest.fn().mockImplementation(() => {
            throw new Error(sampleError);
          });
          const res = await app.post('/api/v1/users').send(sampleUsers[0]);
          Joi.object = originalImplementation;
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty('error', sampleError);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('validateLoginDetails', () => {
    describe('try', () => {
      it('returns 400 if email and username are not provided', async (done) => {
        try {
          const res = await app.post('/api/v1/users/login').send({
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
          const res = await app.post('/api/v1/users/login').send({
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
    });
    describe('catch', () => {
      it('catches errors thrown in the try block', async (done) => {
        try {
          const originalImplementation = Joi.object;
          const sampleError = 'let"s pretend something went wrong';
          Joi.object = jest.fn().mockImplementation(() => {
            throw new Error(sampleError);
          });
          const res = await app
            .post('/api/v1/users/login')
            .send({ email: 'user_email', password: 'user_password' });
          Joi.object = originalImplementation;
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty('error', sampleError);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
