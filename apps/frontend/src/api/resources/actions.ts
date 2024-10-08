import { axiosInstance } from '../axios';
import { Action } from '../entities';

export async function getUserActions() {
  const response = await axiosInstance.get<Action[]>('/actions');
  return response.data.map((action) => Action.parse(action));
}

export async function createUserAction(actionName: Action['name']) {
  const response = await axiosInstance.post<Action>('/actions', { name: actionName });
  return Action.parse(response.data);
}
