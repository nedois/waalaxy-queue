import express from 'express';
import { container } from '../di';
import { authMiddleware } from '../middlewares';

const controller = express.Router();

controller.get('/credits', authMiddleware, async (request, response) => {
  const credits = await container.getUserCreditsUseCase.execute({ userId: request.user.id });
  response.status(200).send(credits);
});

export default controller;
