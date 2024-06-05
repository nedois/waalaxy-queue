import { randomUUID } from 'node:crypto';

export function uuid() {
  return randomUUID();
}

export function randomInt({ min = 0, max = 100 }: { min?: number; max?: number }) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function timeDifferenceInMilliseconds(date1: Date, date2: Date) {
  return Math.abs(date2.getTime() - date1.getTime());
}
