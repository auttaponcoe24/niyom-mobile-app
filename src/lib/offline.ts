import { useSyncExternalStore } from 'react';

import { isNetworkError } from '@/api/httpClient';
import { readJson, writeJson } from '@/lib/json-store';

/** True while a list on screen came from the device because the API was unreachable. */
let offline = false;
const listeners = new Set<() => void>();

function setOffline(next: boolean) {
  if (offline === next) return;
  offline = next;
  for (const listener of listeners) listener();
}

export function useIsOffline() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => offline
  );
}

/** Call when any request reached the server, so the offline notice clears. */
export function markOnline() {
  setOffline(false);
}

/**
 * Fetch a list and keep a copy on the device. With no signal, the last copy is
 * returned instead so the worker can keep recording meters in the field.
 */
export async function fetchWithOfflineCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const fresh = await fetcher();
    writeJson(`cache-${cacheKey}`, fresh);
    setOffline(false);
    return fresh;
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const cached = readJson<T | null>(`cache-${cacheKey}`, null);
    if (cached === null) throw error;
    setOffline(true);
    return cached;
  }
}

/** Edit a saved list in place, e.g. after a reading reached the server. */
export function patchOfflineCache<T>(
  cacheKey: string,
  update: (value: T) => T
) {
  const cached = readJson<T | null>(`cache-${cacheKey}`, null);
  if (cached !== null) writeJson(`cache-${cacheKey}`, update(cached));
}

export function unitsCacheKey(zoneId: number, date: string, type: string) {
  return `units-${zoneId}-${date}-${type}`;
}
