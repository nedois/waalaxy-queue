import { z } from 'zod';
import { useQuery } from 'react-query';
import { ActionNameSchema, CreditSchema } from '@waalaxy/contract';

import { env } from '../env';

async function getUserCredits(userId: string) {
  return fetch(`${env.VITE_API_URL}/credits`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userId}`,
    },
  })
    .then((response) => response.json())
    .then((data) => z.record(ActionNameSchema, CreditSchema).parse(data));
}

export function useCredits(userId: string) {
  return useQuery(['credits', userId], () => getUserCredits(userId));
}
