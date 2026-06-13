/**
 * salesService — Persistence logic for recording a completed sale.
 *
 * Three-step write:
 *   1. Insert sales_ledger row → get sale_id
 *   2. Insert sales_items_manifest rows (one per cart item)
 *   3. Decrement batch_records.current_stock for FULL_STRIP items
 *      (LOOSE sales come from already-opened strips and don't affect stock)
 */

import { supabase } from '../lib/supabase';
import type { CartItem } from '../hooks/useSaleCart';

export async function recordSale(
  cart: CartItem[],
): Promise<{ success: boolean; error?: string }> {
  // ── Step 1: Insert sales_ledger ───────────────────────────────────

  const totalAmount = cart
    .reduce((sum, item) => sum + parseFloat(item.priceCharged), 0)
    .toFixed(2);

  const { data: saleData, error: saleError } = await supabase
    .from('sales_ledger')
    .insert({ total_amount: totalAmount } as Record<string, unknown>)
    .select('id')
    .single();

  if (saleError || !saleData) {
    return {
      success: false,
      error: saleError?.message ?? 'Failed to create sale record',
    };
  }

  const saleRow = saleData as { id: string };
  const saleId: string = saleRow.id;

  // ── Step 2: Insert sales_items_manifest ───────────────────────────

  const manifestRows = cart.map((item) => ({
    sale_id: saleId,
    batch_id: item.batch.id,
    quantity_type: item.quantityType,
    units_sold: item.quantity,
    price_charged: item.priceCharged,
  }));

  const { error: manifestError } = await supabase
    .from('sales_items_manifest')
    .insert(manifestRows as Record<string, unknown>[]);

  if (manifestError) {
    return { success: false, error: manifestError.message };
  }

  // ── Step 3: Decrement stock for FULL_STRIP items ──────────────────

  const fullStripItems = cart.filter(
    (item) => item.quantityType === 'FULL_STRIP',
  );

  for (const item of fullStripItems) {
    const newStock = item.batch.current_stock - item.quantity;

    const { error: stockError } = await supabase
      .from('batch_records')
      .update({ current_stock: Math.max(0, newStock) } as Record<string, unknown>)
      .eq('id', item.batch.id);

    if (stockError) {
      return { success: false, error: stockError.message };
    }
  }

  return { success: true };
}
