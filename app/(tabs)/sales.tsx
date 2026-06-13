import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT, SPACING, RADIUS, TOUCH_TARGET_MIN } from '../../src/constants/theme';
import { SearchInput } from '../../src/components/SearchInput';
import { ListRow } from '../../src/components/ListRow';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { NumericInput } from '../../src/components/NumericInput';
import { SegmentToggle } from '../../src/components/SegmentToggle';
import { useInventory } from '../../src/hooks/useInventory';
import { useSaleCart } from '../../src/hooks/useSaleCart';
import { createInventorySearchEngine } from '../../src/utils/fuzzySearch';
import type { BatchRecordRow } from '../../src/types/database';
import type { InventoryDisplayItem } from '../../src/hooks/useInventory';

const QTY_OPTIONS = ['FULL STRIP', 'LOOSE'] as const;

export default function SalesScreen() {
  const { items, loading: invLoading, refresh: refreshInv } = useInventory();
  const { cart, addItem, removeItem, total, submitSale, submitting, clearCart } = useSaleCart();

  // ── Search engine (rebuild when items change)
  const searchEngine = useMemo(() => {
    if (items.length === 0) return null;
    return createInventorySearchEngine(
      items.map((i) => ({
        id: i.id,
        item_name: i.item_name,
        composition: i.composition,
        base_unit_size: i.base_unit_size,
      }))
    );
  }, [items]);

  // ── Search state
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryDisplayItem | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<BatchRecordRow | null>(null);
  const [qty, setQty] = useState(1);
  const [qtyType, setQtyType] = useState<string>('FULL STRIP');

  // ── Search results
  const searchResults = useMemo(() => {
    if (!searchEngine || query.length < 2) return [];
    const hits = searchEngine.search(query, 8);
    return hits.map((h) => {
      const full = items.find((i) => i.id === h.item.id);
      return full!;
    }).filter(Boolean);
  }, [searchEngine, query, items]);

  // ── Select item → pick first batch by nearest expiry (FEFO)
  const handleSelectItem = useCallback((item: InventoryDisplayItem) => {
    setSelectedItem(item);
    setQuery(item.item_name);
    // FEFO: sort batches by expiry, pick first with stock > 0
    const sorted = [...item.batches]
      .filter((b) => b.current_stock > 0)
      .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));
    setSelectedBatch(sorted[0] ?? item.batches[0] ?? null);
    setQty(1);
  }, []);

  // ── Computed price
  const computedPrice = useMemo(() => {
    if (!selectedBatch || !selectedItem) return '0.00';
    const mrp = parseFloat(selectedBatch.mrp);
    if (qtyType === 'LOOSE') {
      return ((mrp / selectedItem.base_unit_size) * qty).toFixed(2);
    }
    return (mrp * qty).toFixed(2);
  }, [selectedBatch, selectedItem, qty, qtyType]);

  // ── Add to cart
  const handleAdd = useCallback(() => {
    if (!selectedBatch || !selectedItem) return;
    addItem(
      selectedBatch,
      selectedItem.item_name,
      selectedItem.base_unit_size,
      qty,
      qtyType === 'FULL STRIP' ? 'FULL_STRIP' : 'LOOSE',
    );
    setSelectedItem(null);
    setSelectedBatch(null);
    setQuery('');
    setQty(1);
  }, [selectedBatch, selectedItem, qty, qtyType, addItem]);

  // ── Complete sale
  const handleComplete = useCallback(async () => {
    const result = await submitSale();
    if (result.success) {
      refreshInv();
      Alert.alert('✓ Sale Recorded', `Total: ₹${total}`);
    } else {
      Alert.alert('Error', result.error ?? 'Failed to save sale');
    }
  }, [submitSale, refreshInv, total]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* ── LEFT COLUMN: Item selection */}
        <View style={styles.leftCol}>
          <Text style={styles.header}>New Sale</Text>

          <SearchInput value={query} onChangeText={setQuery} placeholder="Search medicine..." />

          {/* Search results dropdown */}
          {query.length >= 2 && !selectedItem && (
            <View style={styles.dropdown}>
              {invLoading ? (
                <Text style={styles.hint}>Loading inventory...</Text>
              ) : searchResults.length === 0 ? (
                <Text style={styles.hint}>No matches found</Text>
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(i) => i.id}
                  renderItem={({ item }) => (
                    <ListRow
                      title={item.item_name}
                      subtitle={item.composition ?? undefined}
                      rightLabel={`${item.total_stock} strips`}
                      rightSublabel={`₹${item.batches[0]?.mrp ?? '—'}`}
                      dimmed={item.total_stock === 0}
                      onPress={() => handleSelectItem(item)}
                    />
                  )}
                />
              )}
            </View>
          )}

          {/* Selected item — batch, qty, type */}
          {selectedItem && selectedBatch && (
            <View style={styles.selectionBlock}>
              <Text style={styles.selectedName}>{selectedItem.item_name}</Text>
              <Text style={styles.batchInfo}>
                Batch: {selectedBatch.batch_number} · MRP: ₹{selectedBatch.mrp} · Stock: {selectedBatch.current_stock}
              </Text>

              {selectedItem.batches.length > 1 && (
                <View style={styles.batchPicker}>
                  {selectedItem.batches
                    .filter((b) => b.current_stock > 0)
                    .map((b) => (
                      <PrimaryButton
                        key={b.id}
                        label={`${b.batch_number} (₹${b.mrp})`}
                        variant={b.id === selectedBatch.id ? 'primary' : 'ghost'}
                        onPress={() => setSelectedBatch(b)}
                        style={styles.batchBtn}
                      />
                    ))}
                </View>
              )}

              <View style={styles.qtyRow}>
                <NumericInput
                  value={qty}
                  onChange={setQty}
                  min={1}
                  max={qtyType === 'FULL STRIP' ? selectedBatch.current_stock : selectedBatch.current_stock * selectedItem.base_unit_size}
                  label="Quantity"
                />
                <View style={styles.toggleWrap}>
                  <SegmentToggle
                    options={QTY_OPTIONS}
                    selected={qtyType}
                    onSelect={setQtyType}
                  />
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Price:</Text>
                <Text style={styles.priceValue}>₹{computedPrice}</Text>
              </View>

              <PrimaryButton
                label="Add to Cart"
                onPress={handleAdd}
                disabled={!selectedBatch || qty < 1}
                style={styles.addBtn}
              />
            </View>
          )}
        </View>

        {/* ── RIGHT COLUMN: Cart */}
        <View style={styles.rightCol}>
          <Text style={styles.header}>Cart</Text>

          {cart.length === 0 ? (
            <Text style={styles.hint}>No items added yet</Text>
          ) : (
            <FlatList
              data={cart}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item, index }) => (
                <ListRow
                  title={item.itemName}
                  subtitle={`${item.quantityType === 'FULL_STRIP' ? 'Strip' : 'Loose'} × ${item.quantity}`}
                  rightLabel={`₹${item.priceCharged}`}
                  onPress={() => removeItem(index)}
                />
              )}
              style={styles.cartList}
            />
          )}

          <View style={styles.totalBar}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>

          <PrimaryButton
            label="Complete Sale"
            onPress={handleComplete}
            disabled={cart.length === 0}
            loading={submitting}
            style={styles.completeBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, flexDirection: 'row', padding: SPACING.lg },
  leftCol: { flex: 1, marginRight: SPACING.lg },
  rightCol: { width: 380, borderLeftWidth: 1, borderLeftColor: COLORS.border, paddingLeft: SPACING.lg },
  header: { fontSize: FONT.header, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 320,
    marginTop: SPACING.sm,
  },
  hint: { fontSize: FONT.base, color: COLORS.textDim, padding: SPACING.lg, textAlign: 'center' },
  selectionBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedName: { fontSize: FONT.large, fontWeight: '700', color: COLORS.text },
  batchInfo: { fontSize: FONT.base, color: COLORS.textDim, marginTop: SPACING.xs },
  batchPicker: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.md, gap: SPACING.sm },
  batchBtn: { paddingHorizontal: SPACING.md, minHeight: 44 },
  qtyRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: SPACING.lg, gap: SPACING.xl },
  toggleWrap: { flex: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.lg },
  priceLabel: { fontSize: FONT.large, color: COLORS.textDim, marginRight: SPACING.md },
  priceValue: { fontSize: FONT.header, fontWeight: '800', color: COLORS.primary },
  addBtn: { marginTop: SPACING.lg },
  cartList: { flex: 1 },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  totalLabel: { fontSize: FONT.large, fontWeight: '700', color: COLORS.textDim },
  totalValue: { fontSize: FONT.header, fontWeight: '800', color: COLORS.primary },
  completeBtn: { marginTop: SPACING.md },
});
