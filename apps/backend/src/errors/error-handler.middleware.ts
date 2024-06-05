import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export const errorHandler = async (error: unknown, request: Request, response: Response, next: NextFunction) => {
  if (error instanceof ZodError) {
    return response.status(400).send({ message: 'Validation error', errors: error.flatten() });
  }

  next(error);
};
