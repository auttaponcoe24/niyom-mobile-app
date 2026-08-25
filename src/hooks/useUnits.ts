import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mobileGetUnits, mobileSaveUnit } from '@/api/mobile';
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
  const queryParams = { page: 1, limit: 100, ...params };
  const enabled = options?.enabled ?? Boolean(params.zoneId && params.date);

  return useQuery({
    queryKey: unitKeys.list(queryParams),
    queryFn: () => mobileGetUnits(queryParams),
    enabled,
  });
}

export function useSaveUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['save-unit'],
    mutationFn: (body: SaveUnitInput) => mobileSaveUnit(body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: unitKeys.all() }),
        queryClient.invalidateQueries({ queryKey: transactionKeys.all() }),
      ]);
    },
  });
}
