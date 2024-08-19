import axios from 'axios';
import { ACCESS_TOKEN_KEY } from '../constants';
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
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAuthorizationHeader() {
  delete axiosInstance.defaults.headers.Authorization;
}
