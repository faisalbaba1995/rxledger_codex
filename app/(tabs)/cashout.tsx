import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT, SPACING, RADIUS, TOUCH_TARGET_MIN } from '../../src/constants/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { NumericInput } from '../../src/components/NumericInput';
import { ListRow } from '../../src/components/ListRow';
import { useCashOutlays } from '../../src/hooks/useCashOutlays';
import type { OutlayCategory } from '../../src/types/database';

const CATEGORIES: { key: OutlayCategory; label: string; emoji: string }[] = [
  { key: 'EXPENSE', label: 'Expense', emoji: '🧾' },
  { key: 'RUNNER', label: 'Runner', emoji: '🏃' },
  { key: 'SALARY', label: 'Salary', emoji: '💰' },
  { key: 'NEIGHBOR', label: 'Neighbour', emoji: '🏪' },
];

export default function CashOutScreen() {
  const { outlays, loading, addOutlay, adding } = useCashOutlays();

  const [category, setCategory] = useState<OutlayCategory>('EXPENSE');
  const [amount, setAmount] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [notes, setNotes] = useState('');

  const needsRecipient = category === 'RUNNER' || category === 'NEIGHBOR';

  const handleSave = useCallback(async () => {
    if (amount <= 0) {
      Alert.alert('Enter amount', 'Amount must be greater than zero.');
      return;
    }
    const result = await addOutlay(
      category,
      amount.toFixed(2),
      needsRecipient ? recipient || null : null,
      notes || null,
    );
    if (result.success) {
      setAmount(0);
      setRecipient('');
      setNotes('');
      Alert.alert('✓ Saved', `₹${amount.toFixed(2)} recorded as ${category}`);
    } else {
      Alert.alert('Error', result.error ?? 'Failed to save');
    }
  }, [category, amount, recipient, notes, needsRecipient, addOutlay]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* ── LEFT: Form */}
        <View style={styles.leftCol}>
          <Text style={styles.header}>Cash Outlay</Text>

          {/* Category selector */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.catRow}>
            {CATEGORIES.map((c) => (
              <PrimaryButton
                key={c.key}
                label={`${c.emoji} ${c.label}`}
                variant={category === c.key ? 'primary' : 'ghost'}
                onPress={() => setCategory(c.key)}
                style={styles.catBtn}
              />
            ))}
          </View>

          {/* Amount */}
          <View style={styles.field}>
            <NumericInput value={amount} onChange={setAmount} min={0} max={99999} label="Amount (₹)" />
          </View>

          {/* Recipient (conditional) */}
          {needsRecipient && (
            <View style={styles.field}>
              <Text style={styles.label}>Recipient</Text>
              <TextInput
                style={styles.textInput}
                value={recipient}
                onChangeText={setRecipient}
                placeholder={category === 'RUNNER' ? 'Runner name...' : 'Pharmacy name...'}
                placeholderTextColor={COLORS.textPlaceholder}
              />
            </View>
          )}

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="E.g. Tea run, medicine return..."
              placeholderTextColor={COLORS.textPlaceholder}
              multiline
            />
          </View>

          <PrimaryButton
            label="Save Cash Outlay"
            onPress={handleSave}
            loading={adding}
            disabled={amount <= 0}
            style={styles.saveBtn}
          />
        </View>

        {/* ── RIGHT: Today's outlays */}
        <View style={styles.rightCol}>
          <Text style={styles.header}>Today&apos;s Outlays</Text>
          <FlatList
            data={outlays}
            keyExtractor={(o) => o.id}
            renderItem={({ item }) => (
              <ListRow
                title={`₹${item.amount} — ${item.category}`}
                subtitle={[item.recipient, item.notes].filter(Boolean).join(' · ') || undefined}
                rightLabel={formatTime(item.timestamp)}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No outlays recorded today</Text>
            }
            refreshing={loading}
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
  label: { fontSize: FONT.base, color: COLORS.textDim, marginBottom: SPACING.xs },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  catBtn: { paddingHorizontal: SPACING.lg, minHeight: 52 },
  field: { marginBottom: SPACING.lg },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: FONT.base,
    paddingHorizontal: SPACING.lg,
    minHeight: TOUCH_TARGET_MIN,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top', paddingTop: SPACING.md },
  saveBtn: { marginTop: SPACING.md },
  emptyText: { fontSize: FONT.base, color: COLORS.textDim, padding: SPACING.xl, textAlign: 'center' },
});
