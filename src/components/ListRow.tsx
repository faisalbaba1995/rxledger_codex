import React from 'react';
import { Pressable, Text, View, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, FONT, TOUCH_TARGET_MIN, SPACING, RADIUS } from '../constants/theme';

interface ListRowProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  rightSublabel?: string;
  onPress?: () => void;
  highlighted?: boolean;
  dimmed?: boolean;
  style?: ViewStyle;
}

export function ListRow({
  title,
  subtitle,
  rightLabel,
  rightSublabel,
  onPress,
  highlighted = false,
  dimmed = false,
  style,
}: ListRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        highlighted && styles.highlighted,
        dimmed && styles.dimmed,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.left}>
        <Text style={[styles.title, dimmed && styles.dimText]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, dimmed && styles.dimText]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {(rightLabel || rightSublabel) && (
        <View style={styles.right}>
          {rightLabel ? (
            <Text style={[styles.rightLabel, dimmed && styles.dimText]}>{rightLabel}</Text>
          ) : null}
          {rightSublabel ? (
            <Text style={[styles.rightSublabel, dimmed && styles.dimText]}>{rightSublabel}</Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TOUCH_TARGET_MIN,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  highlighted: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  dimmed: {
    opacity: 0.45,
  },
  pressed: {
    backgroundColor: COLORS.surfaceElevated,
  },
  left: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  title: {
    fontSize: FONT.medium,
    color: COLORS.text,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FONT.base,
    color: COLORS.textDim,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  rightLabel: {
    fontSize: FONT.medium,
    color: COLORS.primary,
    fontWeight: '700',
  },
  rightSublabel: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 2,
  },
  dimText: {
    color: COLORS.textPlaceholder,
  },
});
