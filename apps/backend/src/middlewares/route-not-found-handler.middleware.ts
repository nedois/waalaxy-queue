import type { Request, Response } from 'express';

export const routeNotFoundHandlerMiddleware = async (request: Request, response: Response) => {
  return response.status(404).send({ message: 'Route not found' });
};
