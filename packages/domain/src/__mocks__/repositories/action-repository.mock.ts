import { ActionRepository } from '../../repositories/action.repository';

export class ActionRepositoryMock implements ActionRepository {
  findByUserId = jest.fn<ReturnType<ActionRepository['findByUserId']>, Parameters<ActionRepository['findByUserId']>>();
  findMany = jest.fn<ReturnType<ActionRepository['findMany']>, Parameters<ActionRepository['findMany']>>();
  save = jest
    .fn<ReturnType<ActionRepository['save']>, Parameters<ActionRepository['save']>>()
    .mockImplementation((action) => action);
}

export const actionRepositoryMock = new ActionRepositoryMock();
