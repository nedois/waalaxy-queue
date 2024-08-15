import { type BaseEntity } from '../entities';
import { BaseException } from './base.exception';

export class EntityNotFoundException<Entity extends typeof BaseEntity<unknown>> extends BaseException {
  public readonly code = 'ENTITY_NOT_FOUND';

  public readonly statusCode = 404;

  constructor(entityClass: Entity, uid: string) {
    super(`${entityClass.name} "${uid}" not found`);
  }
}
