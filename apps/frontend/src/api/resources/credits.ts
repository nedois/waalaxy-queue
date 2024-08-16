import { axiosInstance } from '../axios';
import { Credit } from '../entities';

export async function getUserCredits() {
  const response = await axiosInstance.get<Credit[]>('/credits');
  return response.data.map((credit) => Credit.parse(credit));
}
