import { CreditRepository } from '../../repositories/credit.repository';

export class CreditRepositoryMock implements CreditRepository {
  findByUserId = jest.fn<ReturnType<CreditRepository['findByUserId']>, Parameters<CreditRepository['findByUserId']>>();
  save = jest.fn<ReturnType<CreditRepository['save']>, Parameters<CreditRepository['save']>>();
  saveMany = jest.fn<ReturnType<CreditRepository['saveMany']>, Parameters<CreditRepository['saveMany']>>();
  findOneByUserIdAndActionName = jest.fn<
    ReturnType<CreditRepository['findOneByUserIdAndActionName']>,
    Parameters<CreditRepository['findOneByUserIdAndActionName']>
  >();
}

export const creditRepositoryMock = new CreditRepositoryMock();
