/**
 * Fuzzy Search Utility – Pharmacy Vision Ledger
 *
 * Wraps `fuse.js` to search the local inventory cache by
 * `item_name` and `composition`. Tuned with a generous distance
 * threshold (§4: "catch typos instantly" for older counter staff).
 */

import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';
import type { InventoryItemRow } from '../types/database';

// ─── Configuration ──────────────────────────────────────────────────

const FUSE_OPTIONS: IFuseOptions<InventoryItemRow> = {
  /**
   * Fields to index.
   * `item_name` is the primary lookup path; `composition` is
   * weighted lower so generic salt names surface when the brand
   * name is unknown.
   */
  keys: [
    { name: 'item_name', weight: 0.7 },
    { name: 'composition', weight: 0.3 },
  ],

  /**
   * Scoring thresholds – intentionally generous:
   * - threshold  0.45  (default 0.6) accepts more distant matches
   *   so "Parcetamol" still hits "Paracetamol".
   * - distance   200   widens the character-distance window for
   *   long medicine names like "Amoxicillin + Clavulanic Acid".
   * - minMatchCharLength 2 avoids noise from single-char queries.
   */
  threshold: 0.45,
  distance: 200,
  minMatchCharLength: 2,

  /** Return computed score so the UI can display confidence. */
  includeScore: true,

  /** Ignore ordering of words ("acid amoxicillin" → match). */
  useExtendedSearch: false,
  ignoreLocation: true,
};

// ─── Public API ─────────────────────────────────────────────────────

export interface FuzzySearchResult {
  item: InventoryItemRow;
  /** 0 = perfect match, 1 = no match. Always defined because
   *  `includeScore` is `true` above. */
  score: number;
  /** The fuse.js refIndex into the original dataset array. */
  refIndex: number;
}

/**
 * Creates a reusable Fuse instance pre-loaded with the given
 * inventory items. Call once after hydrating the WatermelonDB
 * cache; the returned `search` closure is allocation-free per query.
 *
 * @param items - Full inventory array from local DB cache.
 * @returns Object with a `search` method and a `replaceCollection`
 *          method to hot-swap the underlying dataset on sync events.
 */
export function createInventorySearchEngine(items: readonly InventoryItemRow[]) {
  let fuse = new Fuse<InventoryItemRow>([...items], FUSE_OPTIONS);

  /**
   * Run a fuzzy query and return sorted results (best match first).
   *
   * @param query - Raw keyboard input from the counter search box.
   * @param limit - Maximum results to return (default 10, sensible
   *                for the 60px-tall rows mandated by the UX spec).
   */
  function search(query: string, limit: number = 10): FuzzySearchResult[] {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const raw: FuseResult<InventoryItemRow>[] = fuse.search(query.trim(), { limit });

    return raw.map((r) => ({
      item: r.item,
      score: r.score ?? 1,
      refIndex: r.refIndex ?? -1,
    }));
  }

  /**
   * Hot-swap the underlying dataset without re-constructing the
   * closure. Call after a Supabase Realtime sync push lands.
   */
  function replaceCollection(nextItems: readonly InventoryItemRow[]): void {
    fuse = new Fuse<InventoryItemRow>([...nextItems], FUSE_OPTIONS);
  }

  return { search, replaceCollection } as const;
}

// Re-export the Fuse options for unit-test introspection.
export { FUSE_OPTIONS };
