import type { User } from '../entities';

export interface UserRepository {
  findOne(id: string): Promise<User | null> | User | null;
  findOneByUsername(username: string): Promise<User | null> | User | null;
  find(): Promise<User[]> | User[];
  save(user: User): Promise<User> | User;
}
