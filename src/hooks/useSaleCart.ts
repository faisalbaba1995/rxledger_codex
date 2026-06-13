/**
 * useSaleCart — Shopping-cart state for a single sale transaction.
 *
 * Manages cart items, computes prices based on quantity type,
 * and delegates final persistence to salesService.recordSale().
 */

import { useState, useCallback } from 'react';
import type { BatchRecordRow, QuantityType } from '../types/database';
import { recordSale } from '../lib/salesService';

// ─── Public Types ───────────────────────────────────────────────────

export interface CartItem {
  batch: BatchRecordRow;
  itemName: string;
  baseUnitSize: number;
  quantity: number;
  quantityType: QuantityType;
  /** Pre-computed line total as PGNumeric string. */
  priceCharged: string;
}

export interface UseSaleCartReturn {
  cart: CartItem[];
  total: string;
  submitting: boolean;
  addItem: (
    batch: BatchRecordRow,
    itemName: string,
    baseUnitSize: number,
    quantity: number,
    quantityType: QuantityType,
  ) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  submitSale: () => Promise<{ success: boolean; error?: string }>;
}

// ─── Helpers ────────────────────────────────────────────────────────

function computePrice(
  mrp: string,
  baseUnitSize: number,
  quantity: number,
  quantityType: QuantityType,
): string {
  const mrpNum = parseFloat(mrp);

  if (quantityType === 'FULL_STRIP') {
    return (mrpNum * quantity).toFixed(2);
  }

  // LOOSE — price per individual unit × quantity
  return ((mrpNum / baseUnitSize) * quantity).toFixed(2);
}

function computeTotal(cart: CartItem[]): string {
  return cart
    .reduce((sum, item) => sum + parseFloat(item.priceCharged), 0)
    .toFixed(2);
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useSaleCart(): UseSaleCartReturn {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addItem = useCallback(
    (
      batch: BatchRecordRow,
      itemName: string,
      baseUnitSize: number,
      quantity: number,
      quantityType: QuantityType,
    ) => {
      const priceCharged = computePrice(
        batch.mrp,
        baseUnitSize,
        quantity,
        quantityType,
      );

      setCart((prev) => [
        ...prev,
        { batch, itemName, baseUnitSize, quantity, quantityType, priceCharged },
      ]);
    },
    [],
  );

  const removeItem = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const submitSale = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    setSubmitting(true);
    try {
      const result = await recordSale(cart);
      if (result.success) {
        setCart([]);
      }
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [cart]);

  return {
    cart,
    total: computeTotal(cart),
    submitting,
    addItem,
    removeItem,
    clearCart,
    submitSale,
  };
}
