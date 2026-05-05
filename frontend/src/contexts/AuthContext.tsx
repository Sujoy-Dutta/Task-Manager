import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AuthState, LoginCredentials, SignupCredentials, User } from '../types';
import { generateId, generateToken } from '../utils/auth';
import {
  clearSession,
  getStoredUser,
  getToken,
  getUsers,
  saveSession,
  saveUsers,
} from '../utils/storage';

interface AuthContextValue extends AuthState {
  login: (creds: LoginCredentials) => Promise<void>;
  signup: (creds: SignupCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getToken);

  useEffect(() => {
    const storedUser = getStoredUser();
    const storedToken = getToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const login = useCallback(async (creds: LoginCredentials) => {
    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === creds.email.toLowerCase()
    );

    // In real app, password would be verified server-side.
    // Here we just check if the user exists in our local registry.
    const passwords: Record<string, string> = JSON.parse(
      localStorage.getItem('taskflow_passwords') ?? '{}'
    );

    if (!found || passwords[found.id] !== creds.password) {
      throw new Error('Invalid email or password.');
    }

    const newToken = generateToken(found.id);
    saveSession(newToken, found);
    setUser(found);
    setToken(newToken);
  }, []);

  const signup = useCallback(async (creds: SignupCredentials) => {
    const users = getUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === creds.email.toLowerCase()
    );
    if (exists) throw new Error('An account with this email already exists.');

    const newUser: User = {
      id: generateId(),
      name: creds.name.trim(),
      email: creds.email.toLowerCase().trim(),
    };

    const passwords: Record<string, string> = JSON.parse(
      localStorage.getItem('taskflow_passwords') ?? '{}'
    );
    passwords[newUser.id] = creds.password;
    localStorage.setItem('taskflow_passwords', JSON.stringify(passwords));

    saveUsers([...users, newUser]);
    const newToken = generateToken(newUser.id);
    saveSession(newToken, newUser);
    setUser(newUser);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      login,
      signup,
      logout,
    }),
    [user, token, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
