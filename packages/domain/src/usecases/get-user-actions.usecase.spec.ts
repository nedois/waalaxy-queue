import { actionRepositoryMock } from '../__mocks__/repositories';
import { Action } from '../entities';
import { GetUserActionsUseCase } from './get-user-actions.usecase';

describe('GetUserActionsUsecase', () => {
  const userId = 'user-id';
  let usecase: GetUserActionsUseCase;

  beforeEach(() => {
    usecase = new GetUserActionsUseCase(actionRepositoryMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the actions for the given userId', async () => {
    const actions = [
      new Action({
        id: '1',
        userId,
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      }),
      new Action({
        id: '2',
        userId,
        name: 'B',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      }),
    ];
    actionRepositoryMock.findByUserId.mockResolvedValue(actions);

    const result = await usecase.execute({ userId });
    expect(actionRepositoryMock.findByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual(actions);
  });
});
