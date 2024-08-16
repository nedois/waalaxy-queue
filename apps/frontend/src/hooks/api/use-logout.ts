import { useMutation, useQueryClient } from 'react-query';
import { removeAuthorizationHeader } from '../../api';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      new Promise((resolve) => {
        removeAuthorizationHeader();
        resolve(null);
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    }
  );
}
