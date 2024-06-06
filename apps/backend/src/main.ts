import { app } from './app';
import { env } from './env';

import './routers';

const host = env.HOST;
const port = env.PORT;

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
