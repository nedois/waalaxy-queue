import { randomUUID } from 'node:crypto';

type AssignableProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export abstract class BaseEntity<T> {
  declare id: string;

  constructor(args: AssignableProperties<T>) {
    Object.assign(this, args);
  }

  static generateId() {
    return randomUUID();
  }
}
