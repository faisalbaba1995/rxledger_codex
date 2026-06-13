# RxLedger: AI Agent Briefing Document

> **To the AI Agent reading this:** This document contains the complete context of the RxLedger project. Read this thoroughly to understand the domain, the tech stack, what has been implemented, and what the user wants to build next.

## 1. Project Purpose & Vision
**RxLedger** is a custom pharmacy retail intelligence system and Point-of-Sale (POS) app built specifically for a single pharmacy shop in Srinagar, Kashmir. 

The primary vision is to replace the shop's clunky, legacy desktop software (Marg ERP) with a lightning-fast, modern, touch-first Android tablet interface. The app will sit on the counter and must be highly ergonomic for the pharmacist to use during high-traffic hours.

**Design Constraints:**
* **Target Device:** Android Tablet (though currently being tested on a Pixel 9 phone).
* **Ergonomics:** Minimum font size of `18pt` and minimum touch targets of `60px`.
* **Aesthetics:** Premium Dark Mode, high contrast, clean typography.

## 2. The Problem We Are Solving
The existing Marg ERP system is visually cluttered, difficult to navigate, and slows down the retail workflow. Furthermore, medicines in India often lack individual 2D barcodes on the foil strips, making traditional barcode scanners useless. 

To solve this, RxLedger will:
1. Ingest inventory data exported from Marg ERP.
2. Use an AI-powered OCR pipeline (via the tablet's camera) to scan the text on medicine foil strips and automatically extract the **Batch Number** and **Expiry Date** to process a sale instantly.

## 3. Tech Stack
* **Frontend:** React Native (Expo SDK 56), Expo Router, TypeScript.
* **Backend / Database:** Supabase (PostgreSQL).
* **Scripting:** Node.js (`tsx`) for data ingestion scripts.

*Note on Supabase Client:* We are currently using an **untyped** Supabase client (`createClient(url, key)`) and casting the responses at the data-hook boundary. This was a deliberate architectural decision to bypass complex type-resolution conflicts caused by Expo 56's bundler.

## 4. Work Completed So Far (Phases 1 & 2)
The core app scaffolding and database wiring are complete. The app boots and successfully reads/writes to the live Supabase project.

* **Database Schema (Supabase):**
  * `inventory_items`: Catalog of medicines (name, composition, base unit size).
  * `batch_records`: Specific stock batches tied to items (batch number, expiry, MRP, stock count).
  * `sales_ledger`: Master record of transactions.
  * `sales_items_manifest`: Line-items for each sale.
  * `cash_outlays`: Tracks daily expenses, runner payments, and neighbor shop adjustments.
* **Core Screens Built (`app/(tabs)/`):**
  * `dashboard.tsx`: Shows real-time sales vs cash-out metrics.
  * `cashout.tsx`: Interface to record expenses.
  * `stock.tsx`: View current inventory and nearing expiries.
  * `sales.tsx`: The primary POS interface with a cart system.
* **Data Layer (`src/hooks/`):**
  * `useInventory.ts`, `useSaleCart.ts`, `useCashOutlays.ts`, `useDashboard.ts` are fully functional.
  * `salesService.ts` handles complex 3-step transactions (insert ledger -> insert manifest -> decrement batch stock).
* **Data Ingestion (`scripts/parseMargExcel.ts`):**
  * Script written to parse Marg ERP `.xlsx` exports. The parsing and data normalization logic is complete and tested via `--dry-run`.

## 5. Work Left To Do (Phase 3 & Beyond)
The project is currently paused right before beginning **Phase 3**.

**Immediate Next Steps (Phase 3):**
1. **Responsive Layout Fixes:** The app is currently locked to `landscape` orientation without `ScrollView`s, which causes content to overflow on small phone screens (like the user's Pixel). 
   * *Action:* Change `orientation` to `default` in `app.json` and wrap the main views in `ScrollView` and `KeyboardAvoidingView`.
2. **Camera Integration:** Install `expo-camera` and build a modal/interface for capturing photos of medicine strips.
3. **AI OCR Pipeline:** 
   * Build a Supabase Edge Function that accepts the captured image.
   * The Edge Function securely calls the **Google Cloud Vision API** (or an LLM) to extract text, parses out the "Batch" and "Expiry" fields, and returns the structured data to the app to automatically add the item to the cart.

**Deferred to Phase 4:**
* Finish the Supabase upload implementation in `parseMargExcel.ts` to actually push the Marg data into the database.
* Potential integration of WatermelonDB for offline-first capabilities.
* User Authentication & Supabase Row Level Security (RLS).
