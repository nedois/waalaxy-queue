import { useQuery } from 'react-query';
import { getUserCredits } from '../../api';

export function useUserCredits() {
  return useQuery(['credits'], () => getUserCredits());
}
