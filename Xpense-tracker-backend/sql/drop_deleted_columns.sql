-- Run once on an existing database that still has soft-delete columns.

ALTER TABLE categories DROP COLUMN IF EXISTS deleted;
ALTER TABLE transactions DROP COLUMN IF EXISTS deleted;
