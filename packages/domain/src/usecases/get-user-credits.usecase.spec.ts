import { creditRepositoryMock } from '../__mocks__/repositories';
import { Credit } from '../entities';
import { GetUserCreditsUseCase } from './get-user-credits.usecase';

describe('GetUserCreditsUseCase', () => {
  const userId = '3b477874-5111-4507-aab7-268e2e6638a7';
  let usecase: GetUserCreditsUseCase;

  beforeEach(() => {
    usecase = new GetUserCreditsUseCase(creditRepositoryMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the credits for the given userId', async () => {
    const credits = [
      new Credit({
        id: '1',
        userId,
        actionName: 'A',
        amount: 100,
      }),
      new Credit({
        id: '2',
        userId,
        actionName: 'B',
        amount: 50,
      }),
      new Credit({
        id: '3',
        userId,
        actionName: 'C',
        amount: 20,
      }),
    ];
    creditRepositoryMock.findByUserId.mockResolvedValue(credits);

    const result = await usecase.execute({ userId });
    expect(creditRepositoryMock.findByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual(credits);
  });
});
