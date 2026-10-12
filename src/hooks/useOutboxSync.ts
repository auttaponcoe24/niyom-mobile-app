import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import { flushOutbox, useOutbox } from '@/lib/outbox';
import { transactionKeys, unitKeys } from '@/utils/query-keys';

const RETRY_MS = 30_000;

/**
 * Sends readings recorded offline: when the app opens or comes back to the
 * foreground, and every 30 s while something is still waiting.
 * Returns `syncNow` for a manual retry (also retries server-refused entries).
 */
export function useOutboxSync(enabled: boolean) {
  const queryClient = useQueryClient();
  const waiting = useOutbox().filter((entry) => !entry.error).length;

  const sync = useCallback(
    async (retryRejected = false) => {
      const sent = await flushOutbox(retryRejected);
      if (sent > 0) {
        void queryClient.invalidateQueries({ queryKey: unitKeys.all() });
        void queryClient.invalidateQueries({ queryKey: transactionKeys.all() });
      }
      return sent;
    },
    [queryClient]
  );

  useEffect(() => {
    if (!enabled) return;
    void sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void sync();
    });
    return () => subscription.remove();
  }, [enabled, sync]);

  useEffect(() => {
    if (!enabled || waiting === 0) return;
    const timer = setInterval(() => void sync(), RETRY_MS);
    return () => clearInterval(timer);
  }, [enabled, waiting, sync]);

  return { syncNow: () => sync(true) };
}
