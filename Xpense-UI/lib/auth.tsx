import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ApiError, NetworkError, api } from '@/lib/api';
import { clearToken, readToken, saveToken } from '@/lib/storage';
import type { User } from '@/lib/types';

type AuthContextValue = {
  ready: boolean;
  token: string | null;
  user: User | null;
  signIn: (idToken: string) => Promise<void>;
  acceptToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleError: (error: unknown) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const signIn = useCallback(async (idToken: string) => {
    const result = await api.login(idToken);
    await saveToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const acceptToken = useCallback(async (nextToken: string) => {
    const me = await api.me(nextToken);
    await saveToken(nextToken);
    setToken(nextToken);
    setUser(me);
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        void signOut();
        return 'Session expired. Sign in again.';
      }
      if (error instanceof ApiError || error instanceof NetworkError) {
        return error.message;
      }
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return 'Something went wrong';
    },
    [signOut]
  );

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setReady(true);
      }
    }, 12_000);

    (async () => {
      try {
        const stored = await readToken();
        if (stored) {
          const me = await api.me(stored);
          if (!cancelled) {
            setToken(stored);
            setUser(me);
          }
        }
      } catch {
        await signOut();
      } finally {
        clearTimeout(timeout);
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({ ready, token, user, signIn, acceptToken, signOut, handleError }),
    [acceptToken, handleError, ready, signIn, signOut, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
