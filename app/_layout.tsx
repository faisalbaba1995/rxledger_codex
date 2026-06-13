import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../src/constants/theme';

/**
 * Root layout — wraps every screen.
 * Sets the dark background and light status bar globally.
 */
export default function RootLayout() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
