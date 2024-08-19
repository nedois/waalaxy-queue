import { axiosInstance, setAuthorizationHeader } from '../axios';

export async function login(username: string) {
  const response = await axiosInstance.post<{ token: string }>('/auth/login', { username });
  setAuthorizationHeader(response.data.token);
}
