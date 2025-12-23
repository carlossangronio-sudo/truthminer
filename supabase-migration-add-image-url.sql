-- Add url_image column to reports table if it doesn't exist (legacy name image_url may exist)
DO $$ BEGIN
    ALTER TABLE reports ADD COLUMN url_image TEXT;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column url_image already exists in reports.';
END $$;

-- Create an index on the url_image column for faster queries (optional)
-- CREATE INDEX IF NOT EXISTS idx_reports_url_image ON reports (url_image) WHERE url_image IS NOT NULL;







