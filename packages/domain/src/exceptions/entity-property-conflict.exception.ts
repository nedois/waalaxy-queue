import { type BaseEntity } from '../entities';
import { BaseException } from './base.exception';

export class EntityPropertyConflictException<Entity extends typeof BaseEntity<unknown>> extends BaseException {
  public readonly code = 'ENTITY_PROPERTY_CONFLICT';

  public readonly statusCode = 400;

  constructor(entityClass: Entity, propertyName: string, propertyValue: string) {
    super(`${entityClass.name} with ${propertyName} "${propertyValue}" already exists`);
  }
}
