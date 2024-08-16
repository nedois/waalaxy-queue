import axios from 'axios';
import { env } from '../env';

export const axiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export function setAuthorizationHeader(token: string) {
  axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
}

export function removeAuthorizationHeader() {
  delete axiosInstance.defaults.headers.Authorization;
}
