import { useEffect, useState } from 'react';
import { z } from 'zod';
import { ActionSchema, type Action } from '@waalaxy/contract';

import { env } from '../env';

function getUserActions(userId: string) {
  return fetch(`${env.API_URL}/actions`, {
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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Action[] | null>(null);

  useEffect(() => {
    getUserActions(userId)
      .then((actions) => setData(actions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return { loading, data };
}
