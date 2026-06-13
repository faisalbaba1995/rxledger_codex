-- Migration 002: Unique index for batch upsert conflict resolution
-- Needed by parseMargExcel.ts to safely re-import without duplicating batches

CREATE UNIQUE INDEX IF NOT EXISTS idx_batch_item_batch
  ON batch_records (item_id, batch_number);
