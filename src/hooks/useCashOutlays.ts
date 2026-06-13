/**
 * useCashOutlays — Manages today's cash outlay records.
 *
 * Fetches outlays where timestamp >= midnight IST today,
 * and exposes addOutlay() for inserting new entries.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CashOutlayRow, OutlayCategory } from '../types/database';

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Returns an ISO-8601 timestamp for the start of today in IST (UTC+05:30).
 * Example: "2026-06-12T00:00:00+05:30"
 */
function getTodayStartIST(): string {
  const now = new Date();

  // Compute IST offset components
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const istMs = utcMs + 5.5 * 60 * 60_000;
  const ist = new Date(istMs);

  const yyyy = ist.getFullYear();
  const mm = String(ist.getMonth() + 1).padStart(2, '0');
  const dd = String(ist.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T00:00:00+05:30`;
}

// ─── Public Types ───────────────────────────────────────────────────

export interface UseCashOutlaysReturn {
  outlays: CashOutlayRow[];
  loading: boolean;
  adding: boolean;
  addOutlay: (
    category: OutlayCategory,
    amount: string,
    recipient: string | null,
    notes: string | null,
  ) => Promise<{ success: boolean; error?: string }>;
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useCashOutlays(): UseCashOutlaysReturn {
  const [outlays, setOutlays] = useState<CashOutlayRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);

  const fetchOutlays = useCallback(async () => {
    setLoading(true);

    const todayStart = getTodayStartIST();

    const { data, error } = await supabase
      .from('cash_outlays')
      .select('*')
      .gte('timestamp', todayStart)
      .order('timestamp', { ascending: false });

    if (!error && data) {
      setOutlays(data as CashOutlayRow[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOutlays();
  }, [fetchOutlays]);

  const addOutlay = useCallback(
    async (
      category: OutlayCategory,
      amount: string,
      recipient: string | null,
      notes: string | null,
    ): Promise<{ success: boolean; error?: string }> => {
      setAdding(true);

      const { error } = await supabase.from('cash_outlays').insert({
        category,
        amount,
        recipient,
        notes,
      } as Record<string, unknown>);

      if (error) {
        setAdding(false);
        return { success: false, error: error.message };
      }

      // Re-fetch to include the server-generated id & timestamp
      await fetchOutlays();
      setAdding(false);
      return { success: true };
    },
    [fetchOutlays],
  );

  return { outlays, loading, adding, addOutlay };
}
