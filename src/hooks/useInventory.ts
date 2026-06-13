/**
 * useInventory — Fetches inventory items with their batch records.
 *
 * Fetches inventory_items and batch_records separately, then
 * computes derived fields (total_stock, nearest_expiry) on the client.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { InventoryItemRow, BatchRecordRow } from '../types/database';

// ─── Public Types ───────────────────────────────────────────────────

export interface InventoryDisplayItem {
  id: string;
  item_name: string;
  composition: string | null;
  base_unit_size: number;
  total_stock: number;
  nearest_expiry: string | null; // ISO date or null when no batches
  batches: BatchRecordRow[];
}

export interface UseInventoryReturn {
  items: InventoryDisplayItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useInventory(): UseInventoryReturn {
  const [items, setItems] = useState<InventoryDisplayItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch items
      const { data: invData, error: invErr } = await supabase
        .from('inventory_items')
        .select('*')
        .order('item_name');

      if (invErr) throw invErr;

      // Fetch all batches
      const { data: batchData, error: batchErr } = await supabase
        .from('batch_records')
        .select('*');

      if (batchErr) throw batchErr;

      const typedInv = (invData ?? []) as InventoryItemRow[];
      const typedBatches = (batchData ?? []) as BatchRecordRow[];

      // Group batches by item_id
      const batchesByItem = new Map<string, BatchRecordRow[]>();
      for (const b of typedBatches) {
        const list = batchesByItem.get(b.item_id) ?? [];
        list.push(b);
        batchesByItem.set(b.item_id, list);
      }

      // Transform into InventoryDisplayItem[]
      const displayItems: InventoryDisplayItem[] = typedInv.map((inv) => {
        const batches = (batchesByItem.get(inv.id) ?? []).sort(
          (a, b) => a.expiry_date.localeCompare(b.expiry_date),
        );

        const total_stock = batches.reduce((sum, b) => sum + b.current_stock, 0);

        const nearest_expiry =
          batches.length > 0
            ? batches.reduce(
                (earliest, b) => (b.expiry_date < earliest ? b.expiry_date : earliest),
                batches[0].expiry_date,
              )
            : null;

        return {
          id: inv.id,
          item_name: inv.item_name,
          composition: inv.composition,
          base_unit_size: inv.base_unit_size,
          total_stock,
          nearest_expiry,
          batches,
        };
      });

      setItems(displayItems);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return { items, loading, error, refresh: fetchInventory };
}
