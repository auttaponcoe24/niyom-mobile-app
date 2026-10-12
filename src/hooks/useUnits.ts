import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mobileGetUnits, mobileSaveUnit } from '@/api/mobile';
import { fetchAllPages } from '@/api/pagination';
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

  return useQuery({
    queryKey: unitKeys.list(queryParams),
    queryFn: () =>
      fetchAllPages((page) => mobileGetUnits({ ...queryParams, page })),
    enabled,
  });
}

export function useSaveUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['save-unit'],
    mutationFn: (body: SaveUnitInput) => mobileSaveUnit(body),
    // Not awaited: the form moves to the next house right away while the
    // lists refresh in the background.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: unitKeys.all() });
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all() });
    },
  });
}
