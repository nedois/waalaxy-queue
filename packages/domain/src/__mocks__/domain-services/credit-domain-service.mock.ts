import { CreditDomainService } from '../../domain-services/credit.domain-service';
import { creditRepositoryMock } from '../repositories/credit-repository.mock';

export class CreditDomainServiceMock extends CreditDomainService {
  recalculateUserCredits = jest.fn<
    ReturnType<CreditDomainService['recalculateUserCredits']>,
    Parameters<CreditDomainService['recalculateUserCredits']>
  >();
}

export const creditDomainServiceMock = new CreditDomainServiceMock(creditRepositoryMock);
