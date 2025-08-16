import { getToken } from './auth.js';

// Generic API client
export const apiGet = async (path, { auth = false } = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json'
  };

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

export const apiPost = async (path, data, { auth = false } = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json'
  };

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Get user's saved order profile
export const getOrderProfile = async (userId) => {
  return await apiGet(`/users/${userId}/order-profile`, { auth: true });
};