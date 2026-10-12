import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { isNetworkError } from '@/api/httpClient';
import { mobileGetUnits, mobileSaveUnit } from '@/api/mobile';
import { fetchAllPages } from '@/api/pagination';
import {
  fetchWithOfflineCache,
  markOnline,
  unitsCacheKey,
} from '@/lib/offline';
import {
  enqueueUnit,
  flushOutbox,
  rememberSentUnit,
  useOutbox,
} from '@/lib/outbox';
import type { ApiPaginated, UnitRow } from '@/types/api';
import {
  transactionKeys,
  type UnitListParams,
  unitKeys,
} from '@/utils/query-keys';

export type SaveUnitInput = Parameters<typeof mobileSaveUnit>[0];

export function useGetUnits(
  params: UnitListParams,
  options?: { enabled?: boolean }
) {
  // Whole zone, not one page: `limit` is only the page size per request.
  const queryParams = { limit: 100, ...params };
  const enabled = options?.enabled ?? Boolean(params.zoneId && params.date);
  const outbox = useOutbox();

  // Readings still waiting to be sent count as recorded on screen, so progress
  // and "next house" keep working with no signal.
  const select = useCallback(
    (response: ApiPaginated<UnitRow>): ApiPaginated<UnitRow> => {
      const waiting = outbox.filter(
        (entry) =>
          entry.body.zoneId === params.zoneId && entry.body.date === params.date
      );
      if (waiting.length === 0) return response;
      return {
        ...response,
        data: response.data.map((row) => {
          const entry = waiting.find(
            (item) =>
              item.body.customerId === row.customerId &&
              item.body.type === row.type
          );
          if (!entry) return row;
          return {
            ...row,
            unitNumber: entry.body.unitNumber,
            isMeterReplaced: entry.body.isMeterReplaced ?? false,
            isMeterRolledOver: entry.body.isMeterRolledOver ?? false,
            previousMeterReading: entry.body.previousMeterReading ?? null,
            pendingSync: true,
            syncError: entry.error,
          };
        }),
      };
    },
    [outbox, params.zoneId, params.date]
  );

  return useQuery({
    queryKey: unitKeys.list(queryParams),
    queryFn: () =>
      fetchWithOfflineCache(
        unitsCacheKey(
          params.zoneId,
          params.date,
          [params.type].flat().join('')
        ),
        () => fetchAllPages((page) => mobileGetUnits({ ...queryParams, page }))
      ),
    select,
    enabled,
  });
}

export function useSaveUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['save-unit'],
    /** Resolves `queued: true` when there was no signal and the reading waits on the device. */
    mutationFn: async ({
      body,
      label,
    }: {
      body: SaveUnitInput;
      label: string;
    }) => {
      try {
        await mobileSaveUnit(body);
        markOnline();
        rememberSentUnit(body);
        return { queued: false };
      } catch (error) {
        if (!isNetworkError(error)) throw error;
        enqueueUnit(body, label);
        return { queued: true };
      }
    },
    // Not awaited: the form moves to the next house right away while the
    // lists refresh in the background.
    onSuccess: ({ queued }) => {
      if (queued) return;
      void queryClient.invalidateQueries({ queryKey: unitKeys.all() });
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all() });
      // Signal is back: send anything recorded while it was gone.
      void flushOutbox();
    },
  });
}
