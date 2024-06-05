import { env } from '../env';
import { InMemoryDatabase } from './in-memory.database';
import { RedisDatabase } from './redis.database';
import { Worker } from '../actions/actions.worker';

const isMemoryDatabase = env.DB_TYPE === 'memory';

let inMemoryDatabase = new InMemoryDatabase();

export const database = isMemoryDatabase ? inMemoryDatabase : new RedisDatabase();

// Sync worker and main thread in memory database
if (isMemoryDatabase) {
  const worker = Worker.getInstance();

  worker.subscribe((message) => {
    if (!message.context.database) {
      return;
    }

    inMemoryDatabase = InMemoryDatabase.hydrate(message.context.database);
  });
}
