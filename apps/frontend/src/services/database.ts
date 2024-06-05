import { useMutation, useQueryClient } from 'react-query';

import { env } from '../env';

async function resetDatabase() {
  return fetch(`${env.VITE_API_URL}/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function useResetDatabase() {
  const queryClient = useQueryClient();

  return useMutation(resetDatabase, {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
