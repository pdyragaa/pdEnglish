-- Add priority column to vocabulary table
ALTER TABLE vocabulary ADD COLUMN priority INTEGER CHECK (priority >= 1 AND priority <= 3);

-- Add index for efficient filtering/sorting by priority
CREATE INDEX idx_vocabulary_priority ON vocabulary(priority);

-- Backfill existing records with priority=2 (medium importance)
UPDATE vocabulary SET priority = 2 WHERE priority IS NULL;
