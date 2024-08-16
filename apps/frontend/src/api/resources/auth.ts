import { axiosInstance, setAuthorizationHeader } from '../axios';
import { User } from '../entities';

export async function login(username: string) {
  const response = await axiosInstance.post<User>('/auth/login', { username });
  const user = User.parse(response.data);

  // Fake auth: using the user id as the token
  setAuthorizationHeader(user.id);

  return user;
}
