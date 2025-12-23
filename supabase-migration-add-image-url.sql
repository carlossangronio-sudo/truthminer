-- Add image_url column to reports table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE reports ADD COLUMN image_url TEXT;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column image_url already exists in reports.';
END $$;

-- Create an index on the image_url column for faster queries (optional)
-- CREATE INDEX IF NOT EXISTS idx_reports_image_url ON reports (image_url) WHERE image_url IS NOT NULL;







