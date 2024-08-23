import { useQuery } from '@tanstack/react-query';
import { getQueueSettings } from '../../api';

export function useQueueSettings() {
  return useQuery({
    queryKey: ['queue', 'settings'],
    queryFn: getQueueSettings,
  });
}
