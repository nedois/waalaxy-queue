import { User, type UserRepository } from '@repo/domain';

const database = new Map<string, User>();

export class UserInMemoryRepository implements UserRepository {
  public readonly database = database;

  findOne(id: string) {
    return this.database.get(id) ?? null;
  }

  findOneByUsername(username: string) {
    const user = this.find().find((u) => u.username === username);
    return user ?? null;
  }

  find() {
    return Array.from(this.database.values());
  }

  save(user: User) {
    this.database.set(user.id, user);
    return user;
  }
}
