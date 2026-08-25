export type QueryKeyPart = string | number | boolean | object | undefined;
export type QueryKey = readonly QueryKeyPart[];

function createQueryKey<const T extends readonly QueryKeyPart[]>(
  ...parts: T
): T {
  return parts;
}

export function defineKey<
  const Parts extends readonly QueryKeyPart[],
  Args extends unknown[] = [],
>(fn: (...args: Args) => Parts): (...args: Args) => Parts {
  return ((...args: Args) => {
    const parts = fn(...args);
    return createQueryKey(...parts);
  }) as unknown as (...args: Args) => Parts;
}

export type QueryKeyBuilder<
  Args extends unknown[] = [],
  Return extends readonly QueryKeyPart[] = readonly QueryKeyPart[],
> = (...args: Args) => Return;

export type QueryKeyRegistry = Record<
  string,
  QueryKeyBuilder<unknown[], readonly QueryKeyPart[]>
>;

type ValidFunction<T> = T extends (...args: infer _A) => infer R
  ? R extends readonly QueryKeyPart[]
    ? T
    : never
  : never;

type ValidateKeyMap<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown
    ? ValidFunction<T[K]>
    : T[K] extends object
      ? ValidateKeyMap<T[K]>
      : never;
};

export class QueryKeyManager {
  private static registry: QueryKeyRegistry = {};
  private static keyNames: Set<string> = new Set();

  static create<
    const KeyMap extends Record<
      string,
      QueryKeyBuilder<unknown[], readonly QueryKeyPart[]> | object
    >,
  >(name: string, keyMap: KeyMap & ValidateKeyMap<KeyMap>): KeyMap {
    if (QueryKeyManager.keyNames.has(name)) {
      return keyMap;
    }

    QueryKeyManager.keyNames.add(name);

    const register = (prefix: string, node: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(node)) {
        const fullKey = `${prefix}.${key}`;
        if (typeof value === 'function') {
          QueryKeyManager.registry[fullKey] = value as QueryKeyBuilder<
            unknown[],
            readonly QueryKeyPart[]
          >;
        } else if (value && typeof value === 'object') {
          register(fullKey, value as Record<string, unknown>);
        }
      }
    };

    register(name, keyMap);

    return keyMap;
  }

  static getQueryKeys(): Readonly<QueryKeyRegistry> {
    return Object.freeze({ ...QueryKeyManager.registry });
  }

  static clearRegistry(): void {
    QueryKeyManager.registry = {};
    QueryKeyManager.keyNames.clear();
  }

  static registerLegacy(
    legacyKey: string,
    builder: QueryKeyBuilder<unknown[], readonly QueryKeyPart[]>
  ): void {
    if (QueryKeyManager.registry[legacyKey]) {
      throw new Error(`Legacy key ${legacyKey} conflicts with existing keys`);
    }
    QueryKeyManager.registry[legacyKey] = builder;
  }

  private constructor() {}
}

export function migrateLegacyKeys<
  T extends QueryKeyBuilder<unknown[], readonly QueryKeyPart[]>,
>(legacyKeyOrKeys: string | string[], newBuilder: T): T {
  if (process.env.NODE_ENV !== 'production') {
    const list = Array.isArray(legacyKeyOrKeys)
      ? legacyKeyOrKeys.join(', ')
      : legacyKeyOrKeys;
    console.warn(`[queryKeyManager] migrating legacy key(s): ${list}`);
  }

  const keys = Array.isArray(legacyKeyOrKeys)
    ? legacyKeyOrKeys
    : [legacyKeyOrKeys];

  for (const key of keys) {
    if (QueryKeyManager.getQueryKeys()[key]) {
      throw new Error(`Legacy key ${key} conflicts with new keys`);
    }
    QueryKeyManager.registerLegacy(key, newBuilder);
  }

  return newBuilder;
}
