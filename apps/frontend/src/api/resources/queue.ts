import { z } from 'zod';
import { axiosInstance } from '../axios';
import { Action } from '../entities';

export async function getUserQueue() {
  const response = await axiosInstance.get<Action[]>('/queue');
  return response.data.map((action) => Action.parse(action));
}

export async function getQueueSettings() {
  const responseSchema = z.object({
    timeUntilCreditRenewal: z.number().nullable(),
    creditRenewalInterval: z.number(),
    actionExecutionInterval: z.number(),
  });

  const response = await axiosInstance.get('/queue/settings');
  return responseSchema.parse(response.data);
}
