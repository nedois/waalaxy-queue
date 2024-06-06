import { app } from './app';
import { accountController, auth } from './auth';
import { errorHandler } from './errors';
import { actionsController } from './actions';
import { creditsController } from './credits';
import { database } from './database';

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.post('/reset', async (request, response) => {
  await database.reset();
  response.send({ message: 'Database reset' });
});

/* ---------------------------- PROTECTED ROUTES ---------------------------- */
app.use(auth);
app.use('/account', accountController);
app.use('/actions', actionsController);
app.use('/credits', creditsController);

app.use(errorHandler);
