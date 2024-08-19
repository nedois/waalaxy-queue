import { userRepositoryMock } from '../__mocks__/repositories';
import { User } from '../entities';
import { GetUserInfoUseCase } from './get-user-info.usecase';

describe('GetUserInfoUseCase', () => {
  let useCase: GetUserInfoUseCase;

  beforeEach(() => {
    useCase = new GetUserInfoUseCase(userRepositoryMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return existing user and isNewUser as false if user exists', async () => {
    const username = 'existing_user';
    const existingUser = new User({ id: 'user-id', username, lockedQueueAt: null, lastActionExecutedAt: null });
    userRepositoryMock.findOneByUsername.mockResolvedValue(existingUser);

    const result = await useCase.execute({ username });

    expect(userRepositoryMock.findOneByUsername).toHaveBeenCalledWith(username);
    expect(userRepositoryMock.save).not.toHaveBeenCalled();
    expect(result).toEqual({ user: existingUser, isNewUser: false });
  });

  it('should create a new user and return it with isNewUser as true if user does not exist', async () => {
    const username = 'new_user';
    userRepositoryMock.findOneByUsername.mockResolvedValue(null);
    userRepositoryMock.save.mockImplementation(async (user) => user); // Mock the save to return the user

    const result = await useCase.execute({ username });

    expect(userRepositoryMock.findOneByUsername).toHaveBeenCalledWith(username);
    expect(userRepositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        username,
        id: expect.any(String),
      })
    );
    expect(result.user.username).toBe(username);
    expect(result.isNewUser).toBe(true);
  });
});
