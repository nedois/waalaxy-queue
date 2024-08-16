import { useMutation, useQueryClient } from 'react-query';
import { login } from '../../api';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation((username: string) => login(username), {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
