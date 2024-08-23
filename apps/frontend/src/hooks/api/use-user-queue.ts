import { useQuery } from '@tanstack/react-query';
import { getUserQueue } from '../../api';

export function useUserQueue() {
  return useQuery({
    queryKey: ['queue'],
    queryFn: getUserQueue,
  });
}
