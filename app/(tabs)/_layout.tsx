import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, TOUCH_TARGET_MIN, SPACING } from '../../src/constants/theme';

/** Simple text-based tab icon (no icon library dependency) */
function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textDim,
      }}
    >
      <Tabs.Screen
        name="sales"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="₹" label="Sales" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Stock" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cashout"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💸" label="Cash Out" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Today" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: TOUCH_TARGET_MIN + 16,
    paddingBottom: 4,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.sm,
  },
  emoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 13,
    color: COLORS.textDim,
    marginTop: 2,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
});
