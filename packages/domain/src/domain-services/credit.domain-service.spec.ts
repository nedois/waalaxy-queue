import { creditRepositoryMock } from '../__mocks__/repositories';
import { actionHandlers } from '../action-handlers';
import { Credit } from '../entities';
import { CreditDomainService } from './credit.domain-service';

describe('CreditDomainService', () => {
  const userId = '3b477874-5111-4507-aab7-268e2e6638a7';
  let service: CreditDomainService;

  beforeEach(() => {
    service = new CreditDomainService(creditRepositoryMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should recalculate and save credits', async () => {
    const existingCredits = actionHandlers.map(
      (HandlerClass) =>
        new Credit({
          userId,
          id: `id-${HandlerClass.actionName}`,
          actionName: HandlerClass.actionName,
          amount: 0,
        })
    );

    creditRepositoryMock.findByUserId.mockResolvedValue(existingCredits);

    await service.recalculateUserCredits(userId);

    expect(creditRepositoryMock.findByUserId).toHaveBeenCalledWith(userId);
    expect(creditRepositoryMock.saveMany).toHaveBeenCalledWith(
      existingCredits.map((credit) =>
        expect.objectContaining({
          userId,
          id: `id-${credit.actionName}`,
          actionName: credit.actionName,
          amount: expect.any(Number),
        })
      )
    );

    const [[savedCredits]] = creditRepositoryMock.saveMany.mock.calls;
    expect(savedCredits).toHaveLength(existingCredits.length);
    savedCredits.forEach((credit) => {
      expect(credit.amount).not.toBe(0);
    });
  });

  it('should create new credits if they do not exist', async () => {
    creditRepositoryMock.findByUserId.mockResolvedValue([]);

    await service.recalculateUserCredits(userId);

    expect(creditRepositoryMock.findByUserId).toHaveBeenCalledWith(userId);
    expect(creditRepositoryMock.saveMany).toHaveBeenCalledWith(
      actionHandlers.map((HandlerClass) =>
        expect.objectContaining({
          userId,
          id: expect.any(String),
          actionName: HandlerClass.actionName,
          amount: expect.any(Number),
        })
      )
    );
  });
});
