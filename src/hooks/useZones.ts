import { useQuery } from '@tanstack/react-query';

import { mobileGetZones } from '@/api/mobile';
import { fetchAllPages } from '@/api/pagination';
import { fetchWithOfflineCache } from '@/lib/offline';
import { type ZoneListParams, zoneKeys } from '@/utils/query-keys';

export function useGetZones(params?: ZoneListParams) {
  const queryParams = { limit: 100, ...params };

  return useQuery({
    queryKey: zoneKeys.list(queryParams),
    queryFn: () =>
      fetchWithOfflineCache('zones', () =>
        fetchAllPages((page) => mobileGetZones({ ...queryParams, page }))
      ),
  });
}
