import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, FONT, SPACING, RADIUS } from '../constants/theme';

interface CardProps {
  title: string;
  value: string;
  subtitle?: string;
  accent?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function Card({ title, value, subtitle, accent = COLORS.primary, style, children }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    minWidth: 160,
  },
  title: {
    fontSize: FONT.base,
    color: COLORS.textDim,
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: FONT.hero,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: SPACING.xs,
  },
});
