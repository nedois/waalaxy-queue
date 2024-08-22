import { queueMock } from '../__mocks__/services';
import { Action } from '../entities';
import { GetUserQueueUseCase } from './get-user-queue.usecase';

describe('GetUserQueueUseCase', () => {
  const userId = '3b477874-5111-4507-aab7-268e2e6638a7';
  let usecase: GetUserQueueUseCase;

  beforeEach(() => {
    usecase = new GetUserQueueUseCase(queueMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call peek method with the correct userId', async () => {
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
    queueMock.peek.mockResolvedValue(actions);

    const result = await usecase.execute({ userId });

    expect(queueMock.peek).toHaveBeenCalledWith(userId);
    expect(result).toEqual(actions);
  });

  it('should return an empty array if no actions are found', async () => {
    queueMock.peek.mockResolvedValue([]);
    const result = await usecase.execute({ userId });

    expect(queueMock.peek).toHaveBeenCalledWith(userId);
    expect(result).toEqual([]);
  });
});
