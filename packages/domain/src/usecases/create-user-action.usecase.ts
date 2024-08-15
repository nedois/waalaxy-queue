import assert from 'node:assert';
import { randomUUID } from 'node:crypto';
import { Action, ActionName, User } from '../entities';
import { EntityNotFoundException } from '../exceptions';
import type { ActionRepository, UserRepository } from '../repositories';
import type { UseCase } from './usecase';

type Input = {
  userId: string;
  name: ActionName;
};

type Output = Action;

export class CreateUserActionUseCase implements UseCase<Input, Output> {
  constructor(private readonly actionRepository: ActionRepository, private readonly userRepository: UserRepository) {}

  async execute(input: Input): Promise<Output> {
    const user = await this.userRepository.findOne(input.userId);
    assert(user, new EntityNotFoundException(User, input.userId));

    const action = new Action({
      id: randomUUID(),
      userId: user.id,
      name: input.name,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      runnedAt: null,
    });

    return this.actionRepository.save(action);
  }
}
