import { isTokenExpired } from './jwt';

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokenIfNeeded(): Promise<boolean> {
  const token = localStorage.getItem('authToken');
  
  if (!token || !isTokenExpired(token)) {
    return true;
  }
  
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }
  
  refreshPromise = refreshAuthToken();
  const result = await refreshPromise;
  refreshPromise = null;
  
  return result;
}

async function refreshAuthToken(): Promise<boolean> {
  try {
    const response = await fetch(import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        query: `
          mutation RefreshToken {
            refreshToken {
              token
              user {
                id
                email
                name
                phone
                avatarUrl
              }
            }
          }
        `,
      }),
    });

    const data = await response.json();
    
    if (data.data?.refreshToken) {
      const { token: newToken, user: newUser } = data.data.refreshToken;
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(newUser));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Try to refresh token if needed before making the request
  await refreshTokenIfNeeded();
  
  const token = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // If we get a 401, try to refresh the token and retry once
  if (response.status === 401 && token) {
    const refreshed = await refreshAuthToken();
    
    if (refreshed) {
      const newToken = localStorage.getItem('authToken');
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      
      return fetch(url, {
        ...options,
        headers,
      });
    }
  }
  
  return response;
}