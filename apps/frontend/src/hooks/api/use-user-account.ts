import { useQuery } from '@tanstack/react-query';
import { getUserAccount } from '../../api';

export function useUserAccount() {
  return useQuery({
    queryKey: ['account'],
    queryFn: getUserAccount,
  });
}
