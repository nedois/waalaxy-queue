import type { Express } from 'express';
import actionsController from './actions.controller';
import authController from './auth.controller';

const controllers = [authController, actionsController];

export function registerControllers(app: Express) {
  controllers.forEach((controller) => app.use(controller));
}
