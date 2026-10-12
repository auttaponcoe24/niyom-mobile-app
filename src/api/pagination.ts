import type { ApiPaginated } from '@/types/api';

/** Guard against a bad `meta` looping forever (50 pages × 100 rows = 5,000 rows). */
const MAX_PAGES = 50;

/**
 * Load every page of a paginated list and return it as one response.
 * Field screens (meter route, payments) need the whole zone at once:
 * progress counts, filters and the swipe pager all work on the full list.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<ApiPaginated<T>>
): Promise<ApiPaginated<T>> {
  const first = await fetchPage(1);
  const rows = [...first.data];
  let meta = first.meta;

  while (meta?.nextPage && meta.currentPage < MAX_PAGES) {
    const next = await fetchPage(meta.nextPage);
    // No progress means the server ignored `page` — stop instead of duplicating rows.
    if (next.data.length === 0 || next.meta.currentPage <= meta.currentPage) {
      break;
    }
    rows.push(...next.data);
    meta = next.meta;
  }

  return { ...first, data: rows, meta };
}
