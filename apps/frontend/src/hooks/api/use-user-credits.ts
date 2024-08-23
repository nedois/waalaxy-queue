import { useQuery } from '@tanstack/react-query';
import { getUserCredits } from '../../api';

export function useUserCredits() {
  return useQuery({
    queryKey: ['credits'],
    queryFn: getUserCredits,
  });
}
