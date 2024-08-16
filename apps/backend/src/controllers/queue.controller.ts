import express from 'express';
import { container } from '../injection-container';
import { authMiddleware } from '../middlewares';

const controller = express.Router();

controller.get('/queue', authMiddleware, async (request, response) => {
  const actions = await container.getUserQueueUseCase.execute({ userId: request.user.id });
  response.status(200).send(actions);
});

export default controller;
