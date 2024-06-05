import express from 'express';
import cors from 'cors';

import { env } from './env';
import { auth } from './auth';
import { errorHandler } from './errors';
import { actionsController } from './actions';

const host = env.HOST;
const port = env.PORT;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use(cors());
app.use(express.json());
app.use(auth);

app.use('actions', actionsController);

app.use(errorHandler);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
