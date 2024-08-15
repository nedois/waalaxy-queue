import type { Express } from 'express';
import authController from './auth.controller';

const controllers = [authController];

export function registerControllers(app: Express) {
  controllers.forEach((controller) => app.use(controller));
}
