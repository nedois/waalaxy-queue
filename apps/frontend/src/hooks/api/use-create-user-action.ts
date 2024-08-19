import { useMutation, useQueryClient } from 'react-query';
import { createUserAction } from '../../api';
import { Action } from '../../api/entities';

export function useCreateUserAction() {
  const queryClient = useQueryClient();

  return useMutation((actionName: Action['name']) => createUserAction(actionName), {
    onSuccess: () => {
      queryClient.invalidateQueries(['actions']);
      queryClient.invalidateQueries(['queue']);
    },
  });
}
