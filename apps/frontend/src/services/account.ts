import { useQuery } from 'react-query';
import { UserSchema } from '@waalaxy/contract';

import { env } from '../env';

async function getUserAccount(userId: string) {
  return fetch(`${env.VITE_API_URL}/account`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userId}`,
    },
  })
    .then((response) => response.json())
    .then((data) => UserSchema.parse(data));
}

export function useAccount(userId: string) {
  return useQuery(['account', userId], () => getUserAccount(userId));
}
