import express from 'express';
import { LoginDtoSchema } from '../dtos';
import { container } from '../injection-container';

const controller = express.Router();

controller.post('/auth/login', async (request, response) => {
  const { username } = LoginDtoSchema.parse(request.body);

  const { user, isNewUser } = await container.getUserInfoUseCase.execute({ username });

  if (isNewUser) {
    // Recalculate user credits if new user is created
    // normally this would be done in signup handler
    await container.recalculateUserCreditsUseCase.execute({ userId: user.id });
  }

  response.status(200).send(user);
});

export default controller;
