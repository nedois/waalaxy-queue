import { queueProcessorMock } from '../__mocks__/services';
import { Action } from '../entities';
import { GetUserQueueUseCase } from './get-user-queue.usecase';

describe('GetUserQueueUseCase', () => {
  const userId = 'user-id';
  let usecase: GetUserQueueUseCase;

  beforeEach(() => {
    usecase = new GetUserQueueUseCase(queueProcessorMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call getUserQueue with the correct userId', async () => {
    const actions = [
      new Action({
        id: 'action-1',
        userId,
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      }),
      new Action({
        id: 'action-2',
        userId,
        name: 'B',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      }),
    ];
    queueProcessorMock.getUserQueue.mockResolvedValue(actions);

    const result = await usecase.execute({ userId });

    expect(queueProcessorMock.getUserQueue).toHaveBeenCalledWith(userId);
    expect(result).toEqual(actions);
  });

  it('should return an empty array if no actions are found', async () => {
    queueProcessorMock.getUserQueue.mockResolvedValue([]);
    const result = await usecase.execute({ userId });

    expect(queueProcessorMock.getUserQueue).toHaveBeenCalledWith(userId);
    expect(result).toEqual([]);
  });
});
