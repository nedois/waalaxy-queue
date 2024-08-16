import express from 'express';

import { bootstrap } from './bootstrap';
import { env } from './env';
import { container } from './injection-container';

const host = env.HOST;
const port = env.PORT;

bootstrap(express())
  .then((app) =>
    app.listen(port, host, () => {
      console.log(`[ ready ] http://${host}:${port}`);
    })
  )
  .then((server) => {
    process.on('SIGTERM', () => {
      server.close(async () => {
        await container.dispose();
        process.exit(0);
      });
    });
  });
