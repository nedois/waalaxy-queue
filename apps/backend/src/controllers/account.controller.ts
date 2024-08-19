import express from 'express';
import { container } from '../injection-container';
import { authMiddleware } from '../middlewares';

const controller = express.Router();

controller.get('/account', authMiddleware, async (request, response) => {
  const { user } = await container.getUserInfoUseCase.execute({ username: request.user.username });
  response.status(200).send(user);
});

export default controller;
