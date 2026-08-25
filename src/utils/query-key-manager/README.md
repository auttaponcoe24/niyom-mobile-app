# query-key-manager

Type-safe helpers for building and registering TanStack Query keys.
Mirrored from `niyom-web-app` — keep both in sync when the API changes.

## Exports

- `defineKey(fn)` — wraps a query key factory so its return type is a `const` tuple
- `QueryKeyManager.create(name, keyMap)` — registers a domain key map once under `name`
- `QueryKeyManager.getQueryKeys()` — frozen snapshot of registered builders

## Usage

```ts
import {
  defineKey,
  QueryKeyManager,
} from '@/utils/query-key-manager/queryKeyManager';

export const zoneKeys = QueryKeyManager.create('zone', {
  all: defineKey(() => ['zones'] as const),
  list: defineKey((params: ZoneListParams) => ['zones', params] as const),
});
```

Register each domain in `src/utils/query-keys/index.ts`. Hooks import via `@/utils/query-keys`.

Note: `QueryKeyPart` does not allow `null` — normalize with `?? undefined`.
