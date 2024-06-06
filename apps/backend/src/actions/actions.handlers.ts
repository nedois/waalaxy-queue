import { randomInt, wait } from '../utils';
import { BaseAction } from './base.action';

class ActionA extends BaseAction {
  public readonly name = 'A' as const;

  public readonly maximumCredit = 10;

  public async execute(): Promise<void> {
    const secondsToWait = randomInt({ min: 1, max: 5 });
    await wait(secondsToWait * 1000);
  }
}

class ActionB extends BaseAction {
  public readonly name = 'B' as const;

  public readonly maximumCredit = 16;

  public async execute(): Promise<void> {
    const secondsToWait = randomInt({ min: 2, max: 6 });
    await wait(secondsToWait * 1000);
  }
}

class ActionC extends BaseAction {
  public readonly name = 'C' as const;

  public readonly maximumCredit = 5;

  public async execute(): Promise<void> {
    const secondsToWait = randomInt({ min: 6, max: 10 });
    await wait(secondsToWait * 1000);
  }
}

export const actionInstances = {
  A: new ActionA(),
  B: new ActionB(),
  C: new ActionC(),
};

export function computeNewCredits() {
  const credits = {
    A: actionInstances.A.generateNewCredit(),
    B: actionInstances.B.generateNewCredit(),
    C: actionInstances.C.generateNewCredit(),
  };

  return credits;
}
