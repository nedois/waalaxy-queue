import express from 'express';
import { container } from '../di';
import { CreateActionDtoSchema } from '../dtos';
import { authMiddleware } from '../middlewares';

const controller = express.Router();

controller.get('/actions', authMiddleware, async (request, response) => {
  const actions = await container.getUserActionsUseCase.execute({ userId: request.user.id });
  response.status(200).send(actions);
});

controller.post('/actions', authMiddleware, async (request, response) => {
  const data = CreateActionDtoSchema.parse(request.body);
  const action = await container.createUserActionUseCase.execute({ ...data, userId: request.user.id });

  response.status(201).send(action);
});

export default controller;
