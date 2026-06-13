import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONT, TOUCH_TARGET_MIN, SPACING, RADIUS } from '../constants/theme';

interface SegmentToggleProps {
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function SegmentToggle({ options, selected, onSelect }: SegmentToggleProps) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const active = opt === selected;
        return (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[styles.segment, active && styles.activeSegment]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    minHeight: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: SPACING.lg,
  },
  activeSegment: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: FONT.base,
    fontWeight: '600',
    color: COLORS.textDim,
  },
  activeLabel: {
    color: '#000',
    fontWeight: '700',
  },
});
