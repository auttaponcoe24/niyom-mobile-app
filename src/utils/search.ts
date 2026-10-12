/** Case-insensitive "contains" over several fields; an empty query matches everything. */
export function matchesSearch(
  query: string,
  fields: (string | number | null | undefined)[]
) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some(
    (field) =>
      field !== null &&
      field !== undefined &&
      String(field).toLowerCase().includes(needle)
  );
}
