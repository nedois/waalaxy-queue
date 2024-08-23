import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeAuthorizationHeader } from '../../api';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      new Promise((resolve) => {
        removeAuthorizationHeader();
        resolve(null);
      }),
    onSuccess: () => {
      queryClient.resetQueries();
    },
  });
}
