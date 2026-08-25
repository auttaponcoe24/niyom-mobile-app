import { useQuery } from '@tanstack/react-query';

import { mobileGetZones } from '@/api/mobile';
import { type ZoneListParams, zoneKeys } from '@/utils/query-keys';

export function useGetZones(params?: ZoneListParams) {
  const queryParams = { page: 1, limit: 100, ...params };

  return useQuery({
    queryKey: zoneKeys.list(queryParams),
    queryFn: () => mobileGetZones(queryParams),
  });
}
