import { useSyncExternalStore } from 'react';

import { isAuthRejection, isNetworkError } from '@/api/httpClient';
import { mobileSaveUnit } from '@/api/mobile';
import { readJson, writeJson } from '@/lib/json-store';
import { markOnline, patchOfflineCache, unitsCacheKey } from '@/lib/offline';
import type { ApiPaginated, UnitRow } from '@/types/api';

export type SaveUnitBody = Parameters<typeof mobileSaveUnit>[0];

/** A meter reading recorded with no signal, waiting to be sent. */
export type OutboxEntry = {
  key: string;
  body: SaveUnitBody;
  label: string;
  createdAt: string;
  /** Set when the server refused it — needs a person to look, not a retry. */
  error?: string;
};

const STORE = 'outbox-units';

let entries: OutboxEntry[] = readJson<OutboxEntry[]>(STORE, []);
const listeners = new Set<() => void>();
let flushing: Promise<number> | null = null;

function commit(next: OutboxEntry[]) {
  entries = next;
  writeJson(STORE, next);
  for (const listener of listeners) listener();
}

/**
 * A reading reached the server: mark it in the saved list too, so an offline
 * restart does not show the house as still to do.
 */
export function rememberSentUnit(body: SaveUnitBody) {
  patchOfflineCache<ApiPaginated<UnitRow>>(
    unitsCacheKey(body.zoneId, body.date, body.type),
    (list) => ({
      ...list,
      data: list.data.map((row) =>
        row.customerId === body.customerId && row.type === body.type
          ? {
              ...row,
              unitNumber: body.unitNumber,
              isMeterReplaced: body.isMeterReplaced ?? false,
              isMeterRolledOver: body.isMeterRolledOver ?? false,
              previousMeterReading: body.previousMeterReading ?? null,
            }
          : row
      ),
    })
  );
}

function entryKey(body: SaveUnitBody) {
  return `${body.customerId}|${body.type}|${body.date}`;
}

export function useOutbox() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => entries
  );
}

export function getOutbox() {
  return entries;
}

/** A newer reading for the same house and month replaces the waiting one. */
export function enqueueUnit(body: SaveUnitBody, label: string) {
  const key = entryKey(body);
  commit([
    ...entries.filter((entry) => entry.key !== key),
    { key, body, label, createdAt: new Date().toISOString() },
  ]);
}

export function discardOutboxEntry(key: string) {
  commit(entries.filter((entry) => entry.key !== key));
}

/**
 * Send waiting readings in the order they were recorded. Stops at the first
 * network failure (still no signal). Returns how many were sent.
 * `retryRejected` also retries the ones the server refused earlier.
 */
export function flushOutbox(retryRejected = false): Promise<number> {
  flushing ??= (async () => {
    let sent = 0;
    for (const entry of [...entries]) {
      if (entry.error && !retryRejected) continue;
      try {
        await mobileSaveUnit(entry.body);
        sent += 1;
        markOnline();
        rememberSentUnit(entry.body);
        commit(entries.filter((item) => item.key !== entry.key));
      } catch (error) {
        // No signal, or the session ended: keep everything and try later.
        if (isNetworkError(error) || isAuthRejection(error)) break;
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'เซิร์ฟเวอร์ไม่รับรายการนี้';
        commit(
          entries.map((item) =>
            item.key === entry.key ? { ...item, error: message } : item
          )
        );
      }
    }
    return sent;
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}
