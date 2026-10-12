import type { UnitType } from '@/types/api';
import {
  defineKey,
  QueryKeyManager,
} from '@/utils/query-key-manager/queryKeyManager';

export type TransactionListParams = {
  page?: number;
  limit?: number;
  search?: string;
  date: string;
  zoneId: number;
  type: UnitType | UnitType[];
  customerId?: string;
};

export const transactionKeys = QueryKeyManager.create('transaction', {
  all: defineKey(() => ['transactions'] as const),
  list: defineKey(
    (params: TransactionListParams) => ['transactions', params] as const
  ),
  receipt: defineKey(
    (transactionId: number) =>
      ['transactions', 'receipt', transactionId] as const
  ),
});
