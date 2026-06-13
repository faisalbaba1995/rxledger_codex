/**
 * useDashboard — Today's aggregate metrics for the home screen.
 *
 * Fetches:
 *   • salesToday  — SUM(total_amount) from sales_ledger
 *   • cashOutToday — SUM(amount) from cash_outlays
 *   • netCash     — salesToday − cashOutToday
 *   • txCount     — COUNT of sales_ledger rows
 *   • recentSales — last 20 sales_ledger rows
 *
 * All scoped to timestamps >= midnight IST today.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SalesLedgerRow } from '../types/database';

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Returns an ISO-8601 timestamp for the start of today in IST (UTC+05:30).
 */
function getTodayStartIST(): string {
  const now = new Date();

  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const istMs = utcMs + 5.5 * 60 * 60_000;
  const ist = new Date(istMs);

  const yyyy = ist.getFullYear();
  const mm = String(ist.getMonth() + 1).padStart(2, '0');
  const dd = String(ist.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T00:00:00+05:30`;
}

// ─── Public Types ───────────────────────────────────────────────────

export interface UseDashboardReturn {
  salesToday: string;
  cashOutToday: string;
  netCash: string;
  txCount: number;
  recentSales: SalesLedgerRow[];
  loading: boolean;
  refresh: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useDashboard(): UseDashboardReturn {
  const [salesToday, setSalesToday] = useState<string>('0.00');
  const [cashOutToday, setCashOutToday] = useState<string>('0.00');
  const [txCount, setTxCount] = useState<number>(0);
  const [recentSales, setRecentSales] = useState<SalesLedgerRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const todayStart = getTodayStartIST();

    // Fire all queries concurrently
    const [salesResult, outlayResult, recentResult] = await Promise.all([
      // Today's sales rows (need both SUM and COUNT)
      supabase
        .from('sales_ledger')
        .select('total_amount')
        .gte('timestamp', todayStart),

      // Today's cash outlays
      supabase
        .from('cash_outlays')
        .select('amount')
        .gte('timestamp', todayStart),

      // Last 20 sales regardless of date
      supabase
        .from('sales_ledger')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20),
    ]);

    // ── Compute sales total & count ─────────────────────────────────
    if (salesResult.data) {
      const rows = salesResult.data as { total_amount: string }[];
      const total = rows
        .reduce((sum, row) => sum + parseFloat(row.total_amount), 0)
        .toFixed(2);
      setSalesToday(total);
      setTxCount(rows.length);
    }

    // ── Compute cash-out total ──────────────────────────────────────
    if (outlayResult.data) {
      const rows = outlayResult.data as { amount: string }[];
      const total = rows
        .reduce((sum, row) => sum + parseFloat(row.amount), 0)
        .toFixed(2);
      setCashOutToday(total);
    }

    // ── Recent sales ────────────────────────────────────────────────
    if (recentResult.data) {
      setRecentSales(recentResult.data as SalesLedgerRow[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Derived value — computed every render from state
  const salesNum = parseFloat(salesToday);
  const cashOutNum = parseFloat(cashOutToday);
  const netCash = (salesNum - cashOutNum).toFixed(2);

  return {
    salesToday,
    cashOutToday,
    netCash,
    txCount,
    recentSales,
    loading,
    refresh: fetchDashboard,
  };
}
