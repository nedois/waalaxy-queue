import { useAuth } from '../../hooks';
import type { AuthGuardProps } from './auth-guard.types';

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
