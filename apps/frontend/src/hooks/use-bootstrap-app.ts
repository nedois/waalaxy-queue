import { useEffect, useState } from 'react';
import { setAuthorizationHeader } from '../api';
import { ACCESS_TOKEN_KEY } from '../constants';

export function useBootstrapApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      setAuthorizationHeader(token);
    }

    setLoading(false);
  }, []);

  return loading;
}
