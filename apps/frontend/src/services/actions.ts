import { z } from 'zod';
import { ActionSchema } from '@waalaxy/contract';

import { env } from '../env';
import { useQuery } from 'react-query';

async function getUserActions(userId: string) {
  return fetch(`${env.VITE_API_URL}/actions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userId}`,
    },
  })
    .then((response) => response.json())
    .then((data) => z.array(ActionSchema).parse(data));
}

export function useActions(userId: string) {
  return useQuery(['actions', userId], () => getUserActions(userId));
}
