import { useEffect, useState } from 'react';
import { z } from 'zod';
import { type ActionName, ActionNameSchema, CreditSchema, type Credit } from '@waalaxy/contract';

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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Partial<Record<ActionName, Credit>> | null>(null);

  useEffect(() => {
    getUserCredits(userId)
      .then((credits) => setData(credits))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return { loading, data };
}
