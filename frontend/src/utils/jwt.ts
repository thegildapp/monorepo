interface JWTPayload {
  userId: string;
  exp?: number;
  iat?: number;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  // Check if token expires in the next 5 minutes
  const expiryTime = payload.exp * 1000;
  const currentTime = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  return currentTime >= expiryTime - fiveMinutes;
}

export function getTokenExpiry(token: string): Date | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }
  
  return new Date(payload.exp * 1000);
}