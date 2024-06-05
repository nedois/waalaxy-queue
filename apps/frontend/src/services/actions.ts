import { z } from 'zod';
import { useEffect } from 'react';
import { ActionSchema, type CreateActionDto } from '@waalaxy/contract';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import { env } from '../env';

async function getUserActions(userId: string) {
  return fetch(`${env.VITE_API_URL}/actions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userId}`,
    },
  })
    .then((response) => response.json())
    .then((response) => z.array(ActionSchema).parse(response));
}

export function useActions(userId: string) {
  return useQuery(['actions', userId], () => getUserActions(userId));
}

async function addUserAction(userId: string, data: CreateActionDto) {
  return fetch(`${env.VITE_API_URL}/actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((response) => ActionSchema.parse(response));
}

export function useAddAction(userId: string) {
  const queryClient = useQueryClient();

  return useMutation((data: CreateActionDto) => addUserAction(userId, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['actions', userId]);
    },
  });
}

interface UseSubscribeToActionsOptions {
  onRunningAction?: () => void;
}

export function useSubscribeToActions(userId: string, options?: UseSubscribeToActionsOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource(`${env.VITE_API_URL}/actions/subscribe?token=${userId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      queryClient.refetchQueries(['actions', userId]);
      queryClient.refetchQueries(['credits', userId]);

      if (data.type === 'ACTION:RUNNING') {
        options?.onRunningAction?.();
      }
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);
}
