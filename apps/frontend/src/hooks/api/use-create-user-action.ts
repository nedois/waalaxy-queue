import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUserAction } from '../../api';

export function useCreateUserAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}
