import type { NextFunction, Request, Response } from 'express';

import { database } from '../database';

/**
 * Fake authentication middleware, just for demonstration purposes.
 * The authorization header should be in the format `Bearer userId`.
 */
export const auth = async (request: Request, response: Response, next: NextFunction) => {
  const { authorization } = request.headers;
  const { token } = request.query;

  if ((authorization && !authorization.startsWith('Bearer ')) ?? typeof token !== 'string') {
    return response.status(401).send({ message: 'Unauthorized' });
  }

  request.userId = authorization?.substring(7).trim() ?? token;

  // Register the user if it does not exist
  database.registerUser(request.userId);

  next();
};
