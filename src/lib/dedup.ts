export interface DedupResult {
  unique: Record<string, string>[];
  duplicateCount: number;
}

/**
 * Removes duplicate rows based on a key field, keeping the first occurrence.
 * Comparison is case-insensitive and trims whitespace.
 */
export function dedup(
  data: Record<string, string>[],
  keyField: string
): DedupResult {
  const seen = new Set<string>();
  const unique: Record<string, string>[] = [];
  let duplicateCount = 0;

  for (const row of data) {
    const raw = row[keyField];
    const key = (raw ?? "").trim().toLowerCase();

    if (key === "") {
      unique.push(row);
      continue;
    }

    if (seen.has(key)) {
      duplicateCount++;
    } else {
      seen.add(key);
      unique.push(row);
    }
  }

  return { unique, duplicateCount };
}

/**
 * Counts duplicates for a given field without removing them.
 */
export function countDuplicates(
  data: Record<string, string>[],
  keyField: string
): number {
  return dedup(data, keyField).duplicateCount;
}
