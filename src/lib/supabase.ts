/**
 * Supabase Client — Pharmacy Vision Ledger
 *
 * Typed singleton. Every screen imports `supabase` from here.
 * Reads EXPO_PUBLIC_* env vars exposed by Expo 56 automatically.
 *
 * NOTE: We use an untyped client (`createClient()` without a generic)
 * because Supabase v2.108's complex conditional types don't resolve
 * correctly with Expo 56's `moduleResolution: "bundler"` config,
 * causing all table queries to resolve as `never`. Instead, we cast
 * return values in hooks and services using our manual Row/Insert types.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Create a .env file in the project root with:\n' +
    '  EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\n' +
    '  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...\n' +
    'See .env.example for the template.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // No auth in Phase 2 — single-shop, single-tablet
    persistSession: false,
    autoRefreshToken: false,
  },
});
