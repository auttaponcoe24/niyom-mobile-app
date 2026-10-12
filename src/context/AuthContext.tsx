import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';

import { isAuthRejection, setSessionExpiredHandler } from '@/api/httpClient';
import {
  mobileGetProfile,
  mobileLogout,
  mobileRefreshSession,
  mobileVerifyOtp,
} from '@/api/mobile';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/token-storage';
import type { User } from '@/types/api';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithOtp: (
    phoneNumber: string,
    code: string,
    deviceName?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function restoreSession(): Promise<User | null> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (accessToken) {
    try {
      return await mobileGetProfile();
    } catch {
      // Access may be expired — try opaque refresh before giving up.
    }
  }

  if (!refreshToken) {
    return null;
  }

  try {
    const refreshed = await mobileRefreshSession(refreshToken);
    await setTokens(
      refreshed.tokens.accessToken,
      refreshed.tokens.refreshToken
    );
    return refreshed.user;
  } catch (error) {
    // Opening the app with no signal must not throw the saved login away.
    if (isAuthRejection(error)) await clearTokens();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const queryClient = useQueryClient();

  // The API refused the refresh token mid-session: back to login instead of
  // leaving every screen showing "unauthenticated".
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      queryClient.clear();
      Alert.alert('เซสชันหมดอายุ', 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
    });
    return () => setSessionExpiredHandler(null);
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    const profile = await mobileGetProfile();
    setUser(profile);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const restored = await restoreSession();
        if (!cancelled) setUser(restored);
      } catch {
        await clearTokens();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithOtp = useCallback(
    async (phoneNumber: string, code: string, deviceName?: string) => {
      const result = await mobileVerifyOtp(phoneNumber, code, deviceName);
      await setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(result.user);
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await mobileLogout();
    } catch {
      // Ignore network errors on logout — clear local session anyway.
    } finally {
      await clearTokens();
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      signInWithOtp,
      signOut,
      refreshProfile,
    }),
    [user, isLoading, signInWithOtp, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
