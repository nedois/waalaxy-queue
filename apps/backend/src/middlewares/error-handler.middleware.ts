import { BaseException } from '@repo/domain';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export const errorHandlerMiddleware = async (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (error instanceof ZodError) {
    return response.status(400).send({ message: 'Validation error', errors: error.flatten().fieldErrors });
  }

  if (error instanceof BaseException) {
    return response.status(error.statusCode ?? 500).send({ message: error.message });
  }

  return response.status(500).send({ message: 'Internal server error' });
};
