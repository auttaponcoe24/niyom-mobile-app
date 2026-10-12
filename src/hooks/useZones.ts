import { useQuery } from '@tanstack/react-query';

import { mobileGetZones } from '@/api/mobile';
import { fetchAllPages } from '@/api/pagination';
import { type ZoneListParams, zoneKeys } from '@/utils/query-keys';

export function useGetZones(params?: ZoneListParams) {
  const queryParams = { limit: 100, ...params };

  return useQuery({
    queryKey: zoneKeys.list(queryParams),
    queryFn: () =>
      fetchAllPages((page) => mobileGetZones({ ...queryParams, page })),
  });
}
