import { useQuery } from '@tanstack/react-query';

import { mobileGetCustomer, mobileGetCustomers } from '@/api/mobile';
import { type CustomerListParams, customerKeys } from '@/utils/query-keys';

export function useGetCustomers(
  params: CustomerListParams,
  options?: { enabled?: boolean }
) {
  const queryParams = { page: 1, limit: 50, ...params };
  const enabled = options?.enabled ?? Boolean(params.zoneId);

  return useQuery({
    queryKey: customerKeys.list(queryParams),
    queryFn: () => mobileGetCustomers(queryParams),
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
