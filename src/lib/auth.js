// Auth helper functions
export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const isLoggedIn = () => {
  const token = getToken();
  return token !== null && token !== '';
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No auth token found');
  }

  const response = await fetch('/api/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem('authToken');
      throw new Error('Authentication expired');
    }
    throw new Error(`Failed to get user: ${response.statusText}`);
  }

  return await response.json();
};

export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const clearToken = () => {
  localStorage.removeItem('authToken');
};