import express from 'express';
import { LoginDtoSchema } from '../dtos';
import { container } from '../injection-container';

const controller = express.Router();

controller.post('/auth/login', async (request, response) => {
  const { username } = LoginDtoSchema.parse(request.body);

  const user = await container.getUserInfoUseCase.execute({ username });

  response.status(200).send(user);
});

export default controller;
