import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONT, TOUCH_TARGET_MIN, SPACING, RADIUS } from '../constants/theme';

interface NumericInputProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function NumericInput({ value, onChange, min = 1, max = 9999, label }: NumericInputProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  const handleText = (text: string) => {
    const n = parseInt(text, 10);
    if (isNaN(n)) return;
    onChange(Math.max(min, Math.min(max, n)));
  };

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <Pressable onPress={decrement} style={styles.stepBtn}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          value={String(value)}
          onChangeText={handleText}
          keyboardType="number-pad"
          selectTextOnFocus
        />
        <Pressable onPress={increment} style={styles.stepBtn}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FONT.base,
    color: COLORS.textDim,
    marginBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: FONT.large,
    color: COLORS.primary,
    fontWeight: '700',
  },
  input: {
    minWidth: 70,
    height: TOUCH_TARGET_MIN,
    textAlign: 'center',
    fontSize: FONT.large,
    fontWeight: '700',
    color: COLORS.text,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
