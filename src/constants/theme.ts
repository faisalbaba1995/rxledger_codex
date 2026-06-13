/**
 * Design System — Pharmacy Vision Ledger
 *
 * All tokens derive from SYSTEM_SPEC.md §4:
 *   - Minimum font 18pt for older staff
 *   - Minimum touch target 60px
 *   - Dark theme optimised for indoor pharmacy lighting
 */

export const COLORS = {
  /** App background — very dark blue-grey */
  bg: '#0F1117',
  /** Card / surface background */
  surface: '#1A1D27',
  /** Elevated surface (modals, dropdowns) */
  surfaceElevated: '#242836',
  /** Primary accent — pharmacy green */
  primary: '#34D399',
  /** Primary pressed state */
  primaryDark: '#059669',
  /** Danger / warning — expiry, errors */
  danger: '#F87171',
  /** Warning — approaching expiry */
  warning: '#FBBF24',
  /** Primary text */
  text: '#F1F5F9',
  /** Secondary / dim text */
  textDim: '#94A3B8',
  /** Placeholder text */
  textPlaceholder: '#64748B',
  /** Border / divider */
  border: '#2D3348',
  /** Input background */
  inputBg: '#1E2233',
} as const;

export const FONT = {
  /** Spec minimum — used for body text, labels, inputs */
  base: 18,
  /** Slightly larger — used for list row titles */
  medium: 20,
  /** Section headers, tab labels */
  large: 24,
  /** Screen titles */
  header: 30,
  /** Dashboard metric values */
  hero: 42,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Spec §4: Minimum 60px for tap elements, dropdown rows, ledger lines */
export const TOUCH_TARGET_MIN = 60;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;
