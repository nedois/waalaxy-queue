import type { Express } from 'express';
import actionsController from './actions.controller';
import authController from './auth.controller';
import creditsController from './credits.controller';

const controllers = [authController, actionsController, creditsController];

export function registerControllers(app: Express) {
  controllers.forEach((controller) => app.use(controller));
}
