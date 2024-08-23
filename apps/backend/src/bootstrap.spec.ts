import express, { type Express } from 'express';
import { bootstrap } from './bootstrap';
import { container } from './di';

describe('Bootstrap', () => {
  let app: Express;

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick'] });

    app = express();
  });

  afterEach(async () => {
    jest.useRealTimers();
    await container.dispose();
  });

  it('should bootstrap the application successfully', async () => {
    const result = await bootstrap(app);
    expect(result).toStrictEqual(app);
  });
});
