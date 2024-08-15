import { User, type UserRepository } from '@repo/domain';

const database = new Map<string, User>();

export class UserInMemoryRepository implements UserRepository {
  findOne(id: string) {
    return database.get(id) ?? null;
  }

  findOneByUsername(username: string) {
    const user = this.find().find((u) => u.username === username);
    return user ?? null;
  }

  find() {
    return Array.from(database.values());
  }

  save(user: User) {
    database.set(user.id, user);
    return user;
  }
}
