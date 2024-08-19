import accountController from './account.controller';
import actionsController from './actions.controller';
import authController from './auth.controller';
import creditsController from './credits.controller';
import notificationsController from './notifications.controller';
import queueController from './queue.controller';

export const controllers = [
  authController,
  actionsController,
  accountController,
  creditsController,
  queueController,
  notificationsController,
];
