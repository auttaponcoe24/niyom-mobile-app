import type { UnitType } from '@/types/api';
import {
  defineKey,
  QueryKeyManager,
} from '@/utils/query-key-manager/queryKeyManager';

export type UnitListParams = {
  page?: number;
  limit?: number;
  search?: string;
  date: string;
  zoneId: number;
  type: UnitType | UnitType[];
};

export const unitKeys = QueryKeyManager.create('unit', {
  all: defineKey(() => ['units'] as const),
  list: defineKey((params: UnitListParams) => ['units', params] as const),
});
