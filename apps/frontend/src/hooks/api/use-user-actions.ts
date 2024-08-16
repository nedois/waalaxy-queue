import { useQuery } from 'react-query';
import { getUserActions } from '../../api';

export function useUserActions() {
  return useQuery(['actions'], () => getUserActions());
}
