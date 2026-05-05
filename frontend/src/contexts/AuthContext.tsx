import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { LoginCredentials, SignupCredentials, User } from '../types';
import api, { getApiError } from '../utils/api';

const TOKEN_KEY = 'taskmind_token';
const USER_KEY  = 'taskmind_user';

function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login:  (creds: LoginCredentials)  => Promise<void>;
  signup: (creds: SignupCredentials) => Promise<void>;
  logout: () => void;
}

interface AuthResponse {
  token: string;
  user: User;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);


  useEffect(() => {
    if (!getToken()) return;
    api.get<{ data: { user: User } }>('/auth/me')
      .then(({ data }) => setUser(data.data.user))
      .catch(() => {
        clearSession();
        setUser(null);
      });
  }, []);

  const applyAuth = useCallback((res: AuthResponse) => {
    saveSession(res.token, res.user);
    setUser(res.user);
  }, []);

  const login = useCallback(async (creds: LoginCredentials) => {
    try {
      const { data } = await api.post<{ data: AuthResponse }>('/auth/login', creds);
      applyAuth(data.data);
    } catch (err) {
      throw new Error(getApiError(err));
    }
  }, [applyAuth]);

  const signup = useCallback(async (creds: SignupCredentials) => {
    try {
      const { data } = await api.post<{ data: AuthResponse }>('/auth/signup', creds);
      applyAuth(data.data);
    } catch (err) {
      throw new Error(getApiError(err));
    }
  }, [applyAuth]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
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
