import type { Request, Response } from 'express';
import { ZodError } from 'zod';

export const errorHandlerMiddleware = async (error: unknown, request: Request, response: Response) => {
  if (error instanceof ZodError) {
    return response.status(400).send({ message: 'Validation error', errors: error.flatten() });
  }

  return response.status(500).send({ message: 'Internal server error' });
};
