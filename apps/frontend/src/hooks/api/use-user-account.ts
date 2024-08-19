import { useQuery } from 'react-query';
import { getUserAccount } from '../../api';

export function useUserAccount() {
  return useQuery(['account'], () => getUserAccount());
}
