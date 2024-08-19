import express from 'express';

import { bootstrap } from './bootstrap';
import { container } from './di/injection-container';
import { env } from './env';

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
