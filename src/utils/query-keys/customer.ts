import {
  defineKey,
  QueryKeyManager,
} from '@/utils/query-key-manager/queryKeyManager';

export type CustomerListParams = {
  page?: number;
  limit?: number;
  search?: string;
  zoneId?: number;
};

export const customerKeys = QueryKeyManager.create('customer', {
  all: defineKey(() => ['customers'] as const),
  list: defineKey(
    (params: CustomerListParams) => ['customers', params] as const
  ),
  detail: defineKey(
    (id: string | null | undefined) => ['customer', id ?? undefined] as const
  ),
});
