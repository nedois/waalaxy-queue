import cors from 'cors';
import express, { Express } from 'express';

import { controllers } from './controllers';
import { container } from './injection-container';
import * as middlewares from './middlewares';

/**
 * Bootstrap the application:
 * - Register middlewares
 * - Register controllers
 * - Start queue processor
 */
export async function bootstrap(app: Express) {
  app.use(cors());
  app.use(express.json());

  // Register all controllers
  controllers.forEach((controller) => app.use(controller));

  app.use(middlewares.routeNotFoundHandlerMiddleware);
  app.use(middlewares.errorHandlerMiddleware);

  await container.queueProcessor.initialize();

  return app;
}
