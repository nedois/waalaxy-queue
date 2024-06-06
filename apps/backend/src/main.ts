import express from 'express';
import cors from 'cors';

import { env } from './env';
import { accountController, auth } from './auth';
import { errorHandler } from './errors';
import { actionsController, Worker } from './actions';
import { creditsController } from './credits';
import { database, RedisDatabase } from './database';

const host = env.HOST;
const port = env.PORT;

const app = express();

app.use(cors()).use(express.json());

app
  .get('/', (request, response) => {
    response.send({ message: 'Hello API' });
  })
  .post('/reset', async (request, response) => {
    await database.reset();
    response.send({ message: 'Database reset' });
  });

/* ---------------------------- PROTECTED ROUTES ---------------------------- */
app
  .use(auth)
  .use('/account', accountController)
  .use('/actions', actionsController)
  .use('/credits', creditsController)
  .use(errorHandler);

const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

process.on('SIGTERM', () => {
  server.close(async () => {
    await Worker.getInstance().terminate();

    if (database instanceof RedisDatabase) {
      database.redis.disconnect();
    }

    process.exit(0);
  });
});
