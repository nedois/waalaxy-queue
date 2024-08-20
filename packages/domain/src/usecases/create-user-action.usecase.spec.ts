import { actionRepositoryMock, userRepositoryMock } from '../__mocks__/repositories';
import { queueProcessorMock } from '../__mocks__/services';
import { Action, User } from '../entities';
import { EntityNotFoundException } from '../exceptions';
import { CreateUserActionUseCase } from './create-user-action.usecase';

describe('CreateUserActionUseCase', () => {
  const userId = '3b477874-5111-4507-aab7-268e2e6638a7';
  let usecase: CreateUserActionUseCase;

  beforeEach(() => {
    usecase = new CreateUserActionUseCase(actionRepositoryMock, userRepositoryMock, queueProcessorMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new action and enqueue it when the user exists', async () => {
    const actionName: Action['name'] = 'A';
    const user = new User({ id: userId, username: 'ana', lastActionExecutedAt: null, lockedQueueAt: null });

    userRepositoryMock.findOne.mockResolvedValue(user);
    actionRepositoryMock.save.mockImplementation(async (action) => action);

    const result = await usecase.execute({ userId, name: actionName });
    expect(userRepositoryMock.findOne).toHaveBeenCalledWith(userId);
    expect(queueProcessorMock.enqueueAction).toHaveBeenCalledWith(result);
    expect(result).toBeInstanceOf(Action);
    expect(actionRepositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        name: actionName,
        status: 'PENDING',
      })
    );
    expect(result.name).toBe(actionName);
    expect(result.userId).toBe(userId);
  });

  it('should throw an EntityNotFoundException if the user does not exist', async () => {
    userRepositoryMock.findOne.mockResolvedValue(null);

    await expect(usecase.execute({ userId, name: 'A' })).rejects.toThrow(new EntityNotFoundException(User, userId));
    expect(userRepositoryMock.findOne).toHaveBeenCalledWith(userId);
    expect(actionRepositoryMock.save).not.toHaveBeenCalled();
    expect(queueProcessorMock.enqueueAction).not.toHaveBeenCalled();
  });
});
