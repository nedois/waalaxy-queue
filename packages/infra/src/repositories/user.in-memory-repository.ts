import { User, type UserRepository } from '@repo/domain';

const users = new Map<string, User>();

export class UserInMemoryRepository implements UserRepository {
  findOne(id: string) {
    return users.get(id) ?? null;
  }

  findOneByUsername(username: string) {
    const user = this.find().find((u) => u.username === username);
    return user ?? null;
  }

  find() {
    return Array.from(users.values());
  }

  save(user: User) {
    users.set(user.id, user);
    return user;
  }
}
