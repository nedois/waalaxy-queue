import { UserRepository } from '../../repositories/user.repository';

export class UserRepositoryMock implements UserRepository {
  findOne = jest.fn<ReturnType<UserRepository['findOne']>, Parameters<UserRepository['findOne']>>();
  find = jest.fn<ReturnType<UserRepository['find']>, Parameters<UserRepository['find']>>();
  save = jest.fn<ReturnType<UserRepository['save']>, Parameters<UserRepository['save']>>();
  findOneByUsername = jest.fn<
    ReturnType<UserRepository['findOneByUsername']>,
    Parameters<UserRepository['findOneByUsername']>
  >();
}
