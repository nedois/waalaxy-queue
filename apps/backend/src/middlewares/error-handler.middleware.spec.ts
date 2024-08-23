import 'express-async-errors';

import { BaseException } from '@repo/domain';
import express, { type Express } from 'express';
import client from 'supertest';
import { ZodError } from 'zod';
import { errorHandlerMiddleware } from './error-handler.middleware';

describe('ErrorHandlerMiddleware', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
  });

  it('should return 400 status code and errors object for ZodError', async () => {
    const zodError = new ZodError([
      { message: 'Invalid value', path: ['name'], code: 'custom' },
      { message: 'Invalid value', path: ['email'], code: 'custom' },
    ]);

    app
      .use((_request, _response, next) => {
        next(zodError);
      })
      .use(errorHandlerMiddleware);

    const response = await client(app).get('/az');

    expect(response.status).toStrictEqual(400);
    expect(response.body).toEqual({
      message: 'Validation error',
      errors: {
        name: ['Invalid value'],
        email: ['Invalid value'],
      },
    });
  });

  it('should return the error status code and error message for BaseException', async () => {
    class CustomException extends BaseException {
      readonly code = 'CUSTOM_EXCEPTION';

      statusCode = 422;

      constructor() {
        super('Custom message');
      }
    }

    const baseException = new CustomException();

    app
      .use((_request, _response, next) => {
        next(baseException);
      })
      .use(errorHandlerMiddleware);

    const response = await client(app).get('/az');

    expect(response.status).toStrictEqual(422);
    expect(response.body).toEqual({ message: 'Custom message' });
  });

  it('should return 500 status code for unknown errors', async () => {
    app
      .use((_request, _response, next) => {
        next(new Error('Some unknown error'));
      })
      .use(errorHandlerMiddleware);

    const response = await client(app).get('/az');

    expect(response.status).toStrictEqual(500);
    expect(response.body).toEqual({ message: 'Internal server error' });
  });
});
