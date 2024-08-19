import type { NextFunction, Request, Response } from 'express';
import { container } from '../injection-container';

/**
 * Fake authentication middleware, just for demonstration purposes.
 * The authorization header should be in the format `Bearer userId`.
 */
export const authMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  const { authorization } = request.headers;
  const { token } = request.query;

  if ((authorization && !authorization.startsWith('Bearer ')) ?? typeof token !== 'string') {
    return response.status(401).send({ message: 'Unauthorized' });
  }

  const userId = authorization?.substring(7).trim() ?? token;

  const user = await container.userRepository.findOne(userId);

  if (!user) {
    return response.status(401).send({ message: 'Unauthorized' });
  }

  request.user = user;

  next();
};
