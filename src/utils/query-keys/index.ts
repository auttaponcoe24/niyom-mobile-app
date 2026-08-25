import { QueryKeyManager } from '@/utils/query-key-manager/queryKeyManager';

import { customerKeys } from './customer';
import { transactionKeys } from './transaction';
import { unitKeys } from './unit';
import { zoneKeys } from './zone';

const QueryKeys = QueryKeyManager.create('queryKeys', {
  customerKeys,
  transactionKeys,
  unitKeys,
  zoneKeys,
});

export type { CustomerListParams } from './customer';
export type { TransactionListParams } from './transaction';
export type { UnitListParams } from './unit';
export type { ZoneListParams } from './zone';
export { customerKeys, transactionKeys, unitKeys, zoneKeys };

export default QueryKeys;
