import cors from 'cors';
import express from 'express';

import { registerControllers } from './controllers';
import { env } from './env';
import { container } from './injection-container';
import { errorHandlerMiddleware, routeNotFoundHandlerMiddleware } from './middlewares';

const host = env.HOST;
const port = env.PORT;

const app = express();

app.use(cors());
app.use(express.json());
registerControllers(app);
app.use(routeNotFoundHandlerMiddleware);
app.use(errorHandlerMiddleware);

const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

process.on('SIGTERM', () => {
  server.close(async () => {
    await container.dispose();

    process.exit(0);
  });
});
