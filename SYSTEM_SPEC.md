# System Specification: Pharmacy Vision Ledger (PVL)

## 1. Core Architecture & Tech Stack
- **Frontend App:** React Native (Expo) optimized for Android Tablet landscape orientation.
- **Local In-App Storage:** WatermelonDB (reactive, offline-first architecture) to ensure instant counter feedback.
- **Backend Infrastructure:** Supabase (PostgreSQL database, Authentication, and Realtime sync engine).
- **Vision Processing Pipeline:** Google Cloud Vision API (Cloud OCR Engine optimized for structured text extraction from medicine foil and documents).
- **API Key Protection:** All calls to Google Cloud Vision must pass through a secure Supabase Edge Function to keep API credentials off the tablet client.

## 2. Data Ingestion & Sync Strategy (The Marg .xlsx Hook)
- **Data Stream:** The system relies on standard `.xlsx` spreadsheets exported from Marg ERP containing columns: `Item Name`, `Batch Number`, `Expiry Date`, `MRP`, `Purchase Rate`, and `Current Stock`.
- **Ingestion Engine:** A custom Node.js parsing script within the repository uses `exceljs` to parse the sheets, normalize data structures, and run bulk upsert queries into the Supabase database.

## 3. Database Schema Blueprint (PostgreSQL / Supabase DDL)

### `inventory_items`
Holds the core master list of medications.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `item_name` (VARCHAR, NOT NULL, UNIQUE) - Clean brand name of the drug.
- `composition` (TEXT, NULLABLE) - Generic medical formulation.
- `base_unit_size` (INT, DEFAULT 10, NOT NULL) - Total tablets per single full strip.

### `batch_records`
Tracks distinct batches, pricing variations, and physical stock limits.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `item_id` (UUID, FOREIGN KEY REFERENCES `inventory_items.id` ON DELETE CASCADE)
- `batch_number` (VARCHAR, NOT NULL)
- `mrp` (NUMERIC(10, 2), NOT NULL) - Maximum Retail Price of a *Full Strip*.
- `purchase_rate` (NUMERIC(10, 2), NOT NULL) - Cost price per full strip from distributor.
- `expiry_date` (DATE, NOT NULL)
- `current_stock` (INT, DEFAULT 0, NOT NULL) - Total count of full strips currently on shelves.

### `sales_ledger`
Tracks individual consumer transactions.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `timestamp` (TIMESTAMPTZ, DEFAULT NOW(), NOT NULL)
- `total_amount` (NUMERIC(10, 2), NOT NULL) - Sum total cash expected for the basket.

### `sales_items_manifest`
Lined breakdown of items per checkout event.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `sale_id` (UUID, FOREIGN KEY REFERENCES `sales_ledger.id` ON DELETE CASCADE)
- `batch_id` (UUID, FOREIGN KEY REFERENCES `batch_records.id`)
- `quantity_type` (VARCHAR, CHECK (quantity_type IN ('FULL_STRIP', 'LOOSE')))
- `units_sold` (INT, NOT NULL) - Number of full strips OR number of individual loose tablets sold.
- `price_charged` (NUMERIC(10, 2), NOT NULL) - Computed line total (`(mrp / base_unit_size) * units_sold` if LOOSE).

### `cash_outlays`
Captures all physical currency leaving the drawer.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `timestamp` (TIMESTAMPTZ, DEFAULT NOW(), NOT NULL)
- `category` (VARCHAR, CHECK (category IN ('EXPENSE', 'RUNNER', 'SALARY', 'NEIGHBOR')))
- `recipient` (VARCHAR, NULLABLE) - Name of distributor runner or neighbor pharmacy.
- `amount` (NUMERIC(10, 2), NOT NULL) - Cash removed.
- `notes` (TEXT, NULLABLE) - Plaintext details (e.g., "Tea run").

## 4. UI/UX Implementation Constraints for older staff
- **Font Scale:** Minimum font size for operational text inputs and labels is 18pt.
- **Touch Targets:** Tap elements, dropdown rows, and ledger lines must maintain a minimum height of 60px.
- **Dual-Pane Interface:** Left Pane handles the active camera view window. Right Pane renders the interactive "Digital Sale Book" replica.
- **Fuzzy Search Integration:** The fallback manual input box must bind to `fuse.js` pointing to the local WatermelonDB cache to catch typos instantly.
