import express from 'express';
import { container } from '../di';
import { authMiddleware } from '../middlewares';

const controller = express.Router();

controller.get('/queue', authMiddleware, async (request, response) => {
  const actions = await container.getUserQueueUseCase.execute({ userId: request.user.id });
  response.status(200).send(actions);
});

controller.get('/queue/settings', authMiddleware, async (request, response) => {
  const settings = await container.getQueueSettingsUseCase.execute();
  response.status(200).send(settings);
});

export default controller;
