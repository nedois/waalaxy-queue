import { useAuth } from '../../hooks';
import type { GuestGuardProps } from './guest-guard.types';

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return children;
}
