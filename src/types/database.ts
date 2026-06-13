/**
 * Pharmacy Vision Ledger — Database Type Declarations
 *
 * These types mirror the PostgreSQL DDL defined in SYSTEM_SPEC.md §3.
 * Each table exposes three shapes:
 *   Row      – what SELECT returns (all columns present)
 *   Insert   – what INSERT accepts (server-defaulted columns optional)
 *   Update   – what UPDATE accepts (every column optional)
 */

// ─── Shared Primitives ──────────────────────────────────────────────

/** ISO-8601 date string (YYYY-MM-DD) for DATE columns. */
export type ISODateString = string;

/** ISO-8601 timestamp with timezone for TIMESTAMPTZ columns. */
export type ISOTimestampTZ = string;

/**
 * Numeric(10,2) represented as a `string` to avoid
 * floating-point drift on the JS side. Supabase returns
 * NUMERIC columns as strings by default.
 */
export type PGNumeric = string;

// ─── Enums (mirroring CHECK constraints) ────────────────────────────

/** `sales_items_manifest.quantity_type` CHECK constraint. */
export type QuantityType = 'FULL_STRIP' | 'LOOSE';

/** `cash_outlays.category` CHECK constraint. */
export type OutlayCategory = 'EXPENSE' | 'RUNNER' | 'SALARY' | 'NEIGHBOR';

// ─── inventory_items ────────────────────────────────────────────────

export interface InventoryItemRow {
  id: string;              // UUID, PK
  item_name: string;       // VARCHAR, NOT NULL, UNIQUE
  composition: string | null; // TEXT, NULLABLE
  base_unit_size: number;  // INT, DEFAULT 10, NOT NULL
}

export interface InventoryItemInsert {
  id?: string;                       // server-generated
  item_name: string;                 // required
  composition?: string | null;       // optional
  base_unit_size?: number;           // defaults to 10
}

export interface InventoryItemUpdate {
  id?: string;
  item_name?: string;
  composition?: string | null;
  base_unit_size?: number;
}

// ─── batch_records ──────────────────────────────────────────────────

export interface BatchRecordRow {
  id: string;               // UUID, PK
  item_id: string;          // UUID, FK → inventory_items.id
  batch_number: string;     // VARCHAR, NOT NULL
  mrp: PGNumeric;           // NUMERIC(10,2), NOT NULL
  purchase_rate: PGNumeric; // NUMERIC(10,2), NOT NULL
  expiry_date: ISODateString; // DATE, NOT NULL
  current_stock: number;    // INT, DEFAULT 0, NOT NULL
}

export interface BatchRecordInsert {
  id?: string;
  item_id: string;
  batch_number: string;
  mrp: PGNumeric;
  purchase_rate: PGNumeric;
  expiry_date: ISODateString;
  current_stock?: number;   // defaults to 0
}

export interface BatchRecordUpdate {
  id?: string;
  item_id?: string;
  batch_number?: string;
  mrp?: PGNumeric;
  purchase_rate?: PGNumeric;
  expiry_date?: ISODateString;
  current_stock?: number;
}

// ─── sales_ledger ───────────────────────────────────────────────────

export interface SalesLedgerRow {
  id: string;               // UUID, PK
  timestamp: ISOTimestampTZ; // TIMESTAMPTZ, DEFAULT NOW()
  total_amount: PGNumeric;  // NUMERIC(10,2), NOT NULL
}

export interface SalesLedgerInsert {
  id?: string;
  timestamp?: ISOTimestampTZ; // server-generated
  total_amount: PGNumeric;
}

export interface SalesLedgerUpdate {
  id?: string;
  timestamp?: ISOTimestampTZ;
  total_amount?: PGNumeric;
}

// ─── sales_items_manifest ───────────────────────────────────────────

export interface SalesItemManifestRow {
  id: string;               // UUID, PK
  sale_id: string;          // UUID, FK → sales_ledger.id
  batch_id: string;         // UUID, FK → batch_records.id
  quantity_type: QuantityType; // CHECK constraint
  units_sold: number;       // INT, NOT NULL
  price_charged: PGNumeric; // NUMERIC(10,2), NOT NULL
}

export interface SalesItemManifestInsert {
  id?: string;
  sale_id: string;
  batch_id: string;
  quantity_type: QuantityType;
  units_sold: number;
  price_charged: PGNumeric;
}

export interface SalesItemManifestUpdate {
  id?: string;
  sale_id?: string;
  batch_id?: string;
  quantity_type?: QuantityType;
  units_sold?: number;
  price_charged?: PGNumeric;
}

// ─── cash_outlays ───────────────────────────────────────────────────

export interface CashOutlayRow {
  id: string;                // UUID, PK
  timestamp: ISOTimestampTZ; // TIMESTAMPTZ, DEFAULT NOW()
  category: OutlayCategory;  // CHECK constraint
  recipient: string | null;  // VARCHAR, NULLABLE
  amount: PGNumeric;         // NUMERIC(10,2), NOT NULL
  notes: string | null;      // TEXT, NULLABLE
}

export interface CashOutlayInsert {
  id?: string;
  timestamp?: ISOTimestampTZ;
  category: OutlayCategory;
  recipient?: string | null;
  amount: PGNumeric;
  notes?: string | null;
}

export interface CashOutlayUpdate {
  id?: string;
  timestamp?: ISOTimestampTZ;
  category?: OutlayCategory;
  recipient?: string | null;
  amount?: PGNumeric;
  notes?: string | null;
}

// ─── Aggregate Database Interface ───────────────────────────────────

/**
 * Top-level shape compatible with Supabase `Database` typing conventions.
 * Usage:  `const supabase = createClient<Database>(url, key)`
 */
export interface Database {
  public: {
    Tables: {
      inventory_items: {
        Row: InventoryItemRow;
        Insert: InventoryItemInsert;
        Update: InventoryItemUpdate;
        Relationships: [
          {
            foreignKeyName: 'batch_records_item_id_fkey';
            columns: ['id'];
            referencedRelation: 'batch_records';
            referencedColumns: ['item_id'];
            isOneToMany: true;
          },
        ];
      };
      batch_records: {
        Row: BatchRecordRow;
        Insert: BatchRecordInsert;
        Update: BatchRecordUpdate;
        Relationships: [
          {
            foreignKeyName: 'batch_records_item_id_fkey';
            columns: ['item_id'];
            referencedRelation: 'inventory_items';
            referencedColumns: ['id'];
            isOneToMany: false;
          },
        ];
      };
      sales_ledger: {
        Row: SalesLedgerRow;
        Insert: SalesLedgerInsert;
        Update: SalesLedgerUpdate;
        Relationships: [];
      };
      sales_items_manifest: {
        Row: SalesItemManifestRow;
        Insert: SalesItemManifestInsert;
        Update: SalesItemManifestUpdate;
        Relationships: [
          {
            foreignKeyName: 'sales_items_manifest_sale_id_fkey';
            columns: ['sale_id'];
            referencedRelation: 'sales_ledger';
            referencedColumns: ['id'];
            isOneToMany: false;
          },
          {
            foreignKeyName: 'sales_items_manifest_batch_id_fkey';
            columns: ['batch_id'];
            referencedRelation: 'batch_records';
            referencedColumns: ['id'];
            isOneToMany: false;
          },
        ];
      };
      cash_outlays: {
        Row: CashOutlayRow;
        Insert: CashOutlayInsert;
        Update: CashOutlayUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
