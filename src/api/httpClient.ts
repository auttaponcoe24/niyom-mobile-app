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
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<ApiEnvelope<MobileAuthData>>(
      `${baseURL}/api/mobile/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const tokens = data.data.tokens;
    await setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  } catch {
    await clearTokens();
    return null;
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
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const nextToken = await refreshPromise;
    if (!nextToken) {
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${nextToken}`;
    return httpClient(original);
  }
);
