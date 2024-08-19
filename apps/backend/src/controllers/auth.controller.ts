import express from 'express';
import { container } from '../di';
import { LoginDtoSchema } from '../dtos';

const controller = express.Router();

controller.post('/auth/login', async (request, response) => {
  const { username } = LoginDtoSchema.parse(request.body);

  const { user, isNewUser } = await container.getUserInfoUseCase.execute({ username });

  if (isNewUser) {
    // Recalculate user credits if new user is created
    // normally this would be done in signup handler
    await container.creditDomainService.recalculateUserCredits(user.id);
  }

  response.status(200).send({ token: user.id });
});

export default controller;
