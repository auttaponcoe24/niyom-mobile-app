import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/token-storage';
import type { ApiEnvelope, MobileAuthData } from '@/types/api';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const httpClient = axios.create({
  baseURL,
  timeout: 30000,
  // Arrays as repeated keys (type=W&type=E): the API rejects `type[]=`.
  paramsSerializer: { indexes: null },
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** `expired`: the server rejected the refresh token. `failed`: could not reach it. */
type RefreshResult = { token: string } | 'expired' | 'failed';

let refreshPromise: Promise<RefreshResult> | null = null;
let onSessionExpired: (() => void) | null = null;

/** AuthContext registers here so an expired session sends the user back to login. */
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

/** True when the API answered and refused the credentials (not a network failure). */
export function isAuthRejection(error: unknown) {
  const status = (error as AxiosError)?.response?.status;
  return status === 401 || status === 403;
}

async function refreshAccessToken(): Promise<RefreshResult> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return 'expired';

  try {
    const { data } = await axios.post<ApiEnvelope<MobileAuthData>>(
      `${baseURL}/api/mobile/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const tokens = data.data.tokens;
    await setTokens(tokens.accessToken, tokens.refreshToken);
    return { token: tokens.accessToken };
  } catch (error) {
    // Field phones drop signal often: only a real rejection ends the session.
    if (!isAuthRejection(error)) return 'failed';
    await clearTokens();
    return 'expired';
  }
}

httpClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const url = original?.url ?? '';
    const isAuthEndpoint =
      url.includes('/api/mobile/auth/otp/') ||
      url.includes('/api/mobile/auth/refresh') ||
      url.includes('/api/mobile/auth/logout');

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    // One refresh (and one expiry notice) no matter how many requests got a 401.
    refreshPromise ??= refreshAccessToken()
      .then((outcome) => {
        if (outcome === 'expired') onSessionExpired?.();
        return outcome;
      })
      .finally(() => {
        refreshPromise = null;
      });

    const result = await refreshPromise;
    if (typeof result === 'string') {
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${result.token}`;
    return httpClient(original);
  }
);
