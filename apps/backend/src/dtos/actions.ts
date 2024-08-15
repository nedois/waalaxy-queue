import { Action } from '@repo/domain';
import { z } from 'zod';

export const CreateActionDtoSchema = z.object({
  name: z.enum(Action.allowedNames),
});
