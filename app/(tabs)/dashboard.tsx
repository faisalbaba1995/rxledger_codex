import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT, SPACING, RADIUS } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { ListRow } from '../../src/components/ListRow';
import { useDashboard } from '../../src/hooks/useDashboard';

export default function DashboardScreen() {
  const {
    salesToday,
    cashOutToday,
    netCash,
    txCount,
    recentSales,
    loading,
    refresh,
  } = useDashboard();

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* ── LEFT: Metric cards */}
        <View style={styles.leftCol}>
          <Text style={styles.header}>Today&apos;s Summary</Text>

          <View style={styles.cardGrid}>
            <Card
              title="Sales"
              value={`₹${salesToday}`}
              subtitle={`${txCount} transaction${txCount !== 1 ? 's' : ''}`}
              accent={COLORS.primary}
              style={styles.card}
            />
            <Card
              title="Cash Out"
              value={`₹${cashOutToday}`}
              accent={COLORS.danger}
              style={styles.card}
            />
            <Card
              title="Net Cash"
              value={`₹${netCash}`}
              subtitle="Sales − Outlays"
              accent={parseFloat(netCash) >= 0 ? COLORS.primary : COLORS.danger}
              style={styles.card}
            />
            <Card
              title="Transactions"
              value={String(txCount)}
              accent={COLORS.text}
              style={styles.card}
            />
          </View>
        </View>

        {/* ── RIGHT: Recent sales */}
        <View style={styles.rightCol}>
          <Text style={styles.header}>Recent Sales</Text>
          <FlatList
            data={recentSales}
            keyExtractor={(s) => s.id}
            renderItem={({ item }) => (
              <ListRow
                title={`₹${item.total_amount}`}
                rightLabel={formatTime(item.timestamp)}
              />
            )}
            refreshing={loading}
            onRefresh={refresh}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {loading ? 'Loading...' : 'No sales yet today'}
              </Text>
            }
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
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
  },
  card: {
    flex: 1,
    minWidth: 200,
  },
  emptyText: { fontSize: FONT.base, color: COLORS.textDim, padding: SPACING.xl, textAlign: 'center' },
});
