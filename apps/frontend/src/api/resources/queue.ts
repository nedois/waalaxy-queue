import { axiosInstance } from '../axios';
import { Action } from '../entities';

export async function getUserQueue() {
  const response = await axiosInstance.get<Action[]>('/queue');
  return Action.parse(response.data);
}
