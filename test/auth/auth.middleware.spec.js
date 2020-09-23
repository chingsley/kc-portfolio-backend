import supertest from 'supertest';
import Joi from '@hapi/joi';

import server from '../../src/server';

const app = supertest(server.server);

describe('authMiddleware', () => {
  describe('validateUUID', () => {
    describe('try', () => {
      it('returns status 400 with errorCode PRT001 if the token is not a valid uuid', async (done) => {
        try {
          const res = await app
            .get('/api/v1/auth/password/validate_reset_token')
            .set('token', 'INVALID-UUID-VALUE');
          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty('error', 'invalid token');
          expect(res.body).toHaveProperty('errorCode', 'PRT001');
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('catches errors thrown in the try block', async (done) => {
        try {
          const oiriginalImplementation = Joi.object;
          const sampleError = 'bummer!';
          Joi.object = jest.fn().mockImplementation(() => {
            throw new Error(sampleError);
          });
          const res = await app
            .get('/api/v1/auth/password/validate_reset_token')
            .set('token', 'INVALID-UUID-VALUE');
          Joi.object = oiriginalImplementation;
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
