import { useQuery } from 'react-query';
import { getQueueSettings } from '../../api';

export function useQueueSettings() {
  return useQuery(['queue', 'settings'], () => getQueueSettings());
}
