import {
  defineKey,
  QueryKeyManager,
} from '@/utils/query-key-manager/queryKeyManager';

export type ZoneListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const zoneKeys = QueryKeyManager.create('zone', {
  all: defineKey(() => ['zones'] as const),
  list: defineKey((params: ZoneListParams = {}) => ['zones', params] as const),
});
