import { randomUUID } from 'node:crypto';

import { User } from '../entities';
import type { UserRepository } from '../repositories';
import type { UseCase } from './usecase';

type Input = {
  username: string;
};

type Output = {
  user: User;
  isNewUser: boolean;
};

export class GetUserInfoUseCase implements UseCase<Input, Output> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: Input): Promise<Output> {
    const user = await this.userRepository.findOneByUsername(input.username);

    // Create user if not found since not authentication mechanism is implemented
    if (!user) {
      const newUser = new User({
        id: randomUUID(),
        username: input.username,
        lockedQueueAt: null,
      });

      await this.userRepository.save(newUser);

      return { user: newUser, isNewUser: true };
    }

    return { user, isNewUser: false };
  }
}
