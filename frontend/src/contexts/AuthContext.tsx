import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { LoginCredentials, SignupCredentials, User } from '../types';
import api, { getApiError } from '../utils/api';


const USER_KEY = 'taskmind_user';

function saveUser(user: User) { localStorage.setItem(USER_KEY, JSON.stringify(user)); }
function clearUser()          { localStorage.removeItem(USER_KEY); }
function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login:  (creds: LoginCredentials)  => Promise<void>;
  signup: (creds: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthResponse {
  user: User;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  useEffect(() => {
    api.get<{ data: { user: User } }>('/auth/me')
      .then(({ data }) => {
        const freshUser = data.data.user;
        saveUser(freshUser);
        setUser(freshUser);
      })
      .catch(() => {
        clearUser();
        setUser(null);
      });
  }, []);

  const login = useCallback(async (creds: LoginCredentials) => {
    try {
      const { data } = await api.post<{ data: AuthResponse }>('/auth/login', creds);
      saveUser(data.data.user);
      setUser(data.data.user);
    } catch (err) {
      throw new Error(getApiError(err));
    }
  }, []);

  const signup = useCallback(async (creds: SignupCredentials) => {
    try {
      const { data } = await api.post<{ data: AuthResponse }>('/auth/signup', creds);
      saveUser(data.data.user);
      setUser(data.data.user);
    } catch (err) {
      throw new Error(getApiError(err));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearUser();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
