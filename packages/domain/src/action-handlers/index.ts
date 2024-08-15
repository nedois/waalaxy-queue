import { AActionHandler } from './a.action-handler';
import { BActionHandler } from './b.action-handler';
import { CActionHandler } from './c.action-handler';

export * from './a.action-handler';
export * from './b.action-handler';
export * from './c.action-handler';

export const actionHandlers = [AActionHandler, BActionHandler, CActionHandler];
