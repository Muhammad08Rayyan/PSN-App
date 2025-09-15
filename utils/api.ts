import axios from 'axios';
import { API_BASE_URL } from './api-config';

// Create axios instance with base URL from environment
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Convenience methods for common HTTP verbs
export const apiGet = async (url: string, config = {}) => {
  return api.get(url, config);
};

export const apiPost = async (url: string, data: any, config = {}) => {
  return api.post(url, data, config);
};

export const apiPut = async (url: string, data: any, config = {}) => {
  return api.put(url, data, config);
};

export const apiDelete = async (url: string, config = {}) => {
  return api.delete(url, config);
};

// Helper for fetch requests (for multipart/form-data)
export const makeFetchRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};