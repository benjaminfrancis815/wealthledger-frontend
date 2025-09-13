import axios from 'axios';
import { appConfig } from '../config/appConfig';
import { getToken } from '../utils/authUtils';

const api = axios.create({
  baseURL: appConfig.API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
