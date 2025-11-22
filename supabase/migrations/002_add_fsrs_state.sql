-- Add FSRS state storage to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS fsrs_state JSONB;

-- Optional: index if querying on parts of fsrs_state in future
-- CREATE INDEX IF NOT EXISTS idx_reviews_fsrs_state ON reviews USING gin (fsrs_state);


