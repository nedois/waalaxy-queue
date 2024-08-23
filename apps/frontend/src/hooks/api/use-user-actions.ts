import { useQuery } from '@tanstack/react-query';
import { getUserActions } from '../../api';

export function useUserActions() {
  return useQuery({
    queryKey: ['actions'],
    queryFn: getUserActions,
  });
}
