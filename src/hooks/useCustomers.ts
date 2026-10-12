import { useQuery } from '@tanstack/react-query';

import { mobileGetCustomer, mobileGetCustomers } from '@/api/mobile';
import { fetchAllPages } from '@/api/pagination';
import { type CustomerListParams, customerKeys } from '@/utils/query-keys';

export function useGetCustomers(
  params: CustomerListParams,
  options?: { enabled?: boolean }
) {
  // Whole zone, not one page: `limit` is only the page size per request.
  const queryParams = { limit: 100, ...params };
  const enabled = options?.enabled ?? Boolean(params.zoneId);

  return useQuery({
    queryKey: customerKeys.list(queryParams),
    queryFn: () =>
      fetchAllPages((page) => mobileGetCustomers({ ...queryParams, page })),
    enabled,
  });
}

export function useGetCustomer(
  customerId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => mobileGetCustomer(customerId),
    enabled: options?.enabled ?? Boolean(customerId),
  });
}
