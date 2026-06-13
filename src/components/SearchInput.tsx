import React, { useCallback, useRef } from 'react';
import { TextInput, View, Pressable, StyleSheet, type TextInputProps } from 'react-native';
import { COLORS, FONT, TOUCH_TARGET_MIN, SPACING, RADIUS } from '../constants/theme';

interface SearchInputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChangeText, placeholder = 'Search medicine...', ...rest }: SearchInputProps) {
  const inputRef = useRef<TextInput>(null);

  const handleClear = useCallback(() => {
    onChangeText('');
    inputRef.current?.focus();
  }, [onChangeText]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <View style={styles.searchDot} />
      </View>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textPlaceholder}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        {...rest}
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearBtn} hitSlop={12}>
          <View style={styles.clearX}>
            <View style={[styles.clearLine, styles.clearLine1]} />
            <View style={[styles.clearLine, styles.clearLine2]} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: TOUCH_TARGET_MIN,
    paddingHorizontal: SPACING.lg,
  },
  iconWrap: {
    marginRight: SPACING.md,
  },
  searchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: COLORS.textDim,
  },
  input: {
    flex: 1,
    fontSize: FONT.base,
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  clearBtn: {
    marginLeft: SPACING.sm,
    padding: SPACING.sm,
  },
  clearX: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearLine: {
    position: 'absolute',
    width: 18,
    height: 2.5,
    backgroundColor: COLORS.textDim,
    borderRadius: 1,
  },
  clearLine1: { transform: [{ rotate: '45deg' }] },
  clearLine2: { transform: [{ rotate: '-45deg' }] },
});
