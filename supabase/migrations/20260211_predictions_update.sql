-- ========================================
-- Update PREDICTIONS Table for Unified System
-- ========================================

-- Add approval status (for FREE users)
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'APPROVED'
  CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED'));

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS approved_by UUID;

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add resolved_by (who resolved the prediction)
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolved_by UUID;

-- Add creator tracking
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_predictions_approval_status ON predictions(approval_status);
CREATE INDEX IF NOT EXISTS idx_predictions_created_by ON predictions(created_by);

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view predictions" ON predictions;

CREATE POLICY "Anyone can view approved predictions"
  ON predictions FOR SELECT
  USING (approval_status = 'APPROVED');

CREATE POLICY "Creators can view their own predictions"
  ON predictions FOR SELECT
  USING (auth.uid() = created_by);

-- ========================================
-- Comments
-- ========================================
COMMENT ON COLUMN predictions.approval_status IS 'PENDING (FREE users) or APPROVED (PREMIUM)';
COMMENT ON COLUMN predictions.resolved_by IS 'User who resolved the prediction';
COMMENT ON COLUMN predictions.created_by IS 'User who created the prediction';
