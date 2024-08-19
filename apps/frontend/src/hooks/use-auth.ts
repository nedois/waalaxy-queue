import { useUserAccount } from './api';

export function useAuth() {
  const { data: user } = useUserAccount();

  return { user, isAuthenticated: Boolean(user) };
}
