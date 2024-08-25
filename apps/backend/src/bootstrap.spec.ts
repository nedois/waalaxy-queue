import express from 'express';
import { bootstrap } from './bootstrap';
import { container } from './di';

describe('Bootstrap', () => {
  afterEach(async () => {
    await container.dispose();
  });

  it('should bootstrap the application successfully', async () => {
    const app = await bootstrap(express());
    expect(app).toBeDefined();
  });
});
