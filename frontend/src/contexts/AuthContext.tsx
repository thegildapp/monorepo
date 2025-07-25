import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { isTokenExpired } from '../utils/jwt';
import { authFetch } from '../utils/authFetch';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const currentToken = localStorage.getItem('authToken');
      if (!currentToken) return false;

      const response = await authFetch(import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(newUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Load auth data from localStorage on mount
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    
    if (savedToken && savedUser) {
      // Check if token is expired
      if (isTokenExpired(savedToken)) {
        // Try to refresh the token
        refreshToken().then((success) => {
          if (!success) {
            // If refresh fails, clear auth
            setToken(null);
            setUser(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
          }
          setIsLoading(false);
        });
      } else {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [refreshToken]);

  // Set up periodic token refresh
  useEffect(() => {
    if (!token) return;

    // Refresh token every 6 days (before 7-day expiry)
    const intervalId = setInterval(() => {
      refreshToken();
    }, 6 * 24 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [token, refreshToken]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}