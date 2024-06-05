import express from 'express';
import cors from 'cors';

import { env } from './env';
import { accountController, auth } from './auth';
import { errorHandler } from './errors';
import { actionsController } from './actions';
import { creditsController } from './credits';

const host = env.HOST;
const port = env.PORT;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use(cors());
app.use(express.json());
app.use(auth);

app.use('/account', accountController);
app.use('/actions', actionsController);
app.use('/credits', creditsController);

app.use(errorHandler);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
