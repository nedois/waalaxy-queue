import { SSENotifier } from '@repo/infra';
import express from 'express';
import { container } from '../di';
import { authMiddleware } from '../middlewares';

const controller = express.Router();

controller.get('/notifications/subscribe', authMiddleware, async (request, response) => {
  if (container.notifier instanceof SSENotifier) {
    container.notifier.subscribe(request, response);
  }
});

export default controller;
