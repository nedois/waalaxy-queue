import { axiosInstance } from '../axios';
import { Action } from '../entities';

export async function getUserQueue() {
  const response = await axiosInstance.get<Action[]>('/queue');
  return response.data.map((action) => Action.parse(action));
}
