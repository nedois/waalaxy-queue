import { axiosInstance } from '../axios';
import { User } from '../entities';

export async function getUserAccount() {
  const response = await axiosInstance.get<User>('/account');
  return User.parse(response.data);
}
