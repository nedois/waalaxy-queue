import { useQuery } from 'react-query';
import { getUserQueue } from '../../api';

export function useUserQueue() {
  return useQuery(['queue'], () => getUserQueue());
}
