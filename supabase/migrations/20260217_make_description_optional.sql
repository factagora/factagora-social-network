-- Make description optional and remove minimum length constraint
-- This improves UX by allowing users to create predictions with short or no descriptions

-- Remove the description check constraint
ALTER TABLE predictions
DROP CONSTRAINT IF EXISTS predictions_description_check;

-- Make description nullable (optional)
ALTER TABLE predictions
ALTER COLUMN description DROP NOT NULL;

-- Add a more lenient check: if description exists, it should be <= 2000 chars
ALTER TABLE predictions
ADD CONSTRAINT predictions_description_check
CHECK (description IS NULL OR LENGTH(description) <= 2000);

COMMENT ON COLUMN predictions.description IS 'Optional description. If provided, max 2000 characters.';
