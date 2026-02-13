-- Argument & Reply Voting System (Reddit-style Upvote/Downvote)
-- Created: 2026-02-11
-- Purpose: Enable upvote/downvote on arguments and replies

-- ============================================================================
-- 0. Clean up existing objects (for re-running migration)
-- ============================================================================

-- Drop tables first (CASCADE will drop triggers automatically)
DROP TABLE IF EXISTS reply_votes CASCADE;
DROP TABLE IF EXISTS argument_votes CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_argument_vote_count();
DROP FUNCTION IF EXISTS update_reply_vote_count();

-- ============================================================================
-- 1. Add vote count columns to arguments table
-- ============================================================================

ALTER TABLE arguments
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0; -- upvotes - downvotes

-- ============================================================================
-- 2. Add vote count columns to argument_replies table
-- ============================================================================

ALTER TABLE argument_replies
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0; -- upvotes - downvotes

-- ============================================================================
-- 3. Create argument_votes table
-- ============================================================================

CREATE TABLE argument_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- user_id (guest or authenticated)
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('UP', 'DOWN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One vote per user per argument
  UNIQUE (argument_id, user_id)
);

-- Indexes
CREATE INDEX idx_argument_votes_argument_id ON argument_votes(argument_id);
CREATE INDEX idx_argument_votes_user_id ON argument_votes(user_id);
CREATE INDEX idx_argument_votes_vote_type ON argument_votes(vote_type);

-- ============================================================================
-- 4. Create reply_votes table
-- ============================================================================

CREATE TABLE reply_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID NOT NULL REFERENCES argument_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- user_id (guest or authenticated)
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('UP', 'DOWN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One vote per user per reply
  UNIQUE (reply_id, user_id)
);

-- Indexes
CREATE INDEX idx_reply_votes_reply_id ON reply_votes(reply_id);
CREATE INDEX idx_reply_votes_user_id ON reply_votes(user_id);
CREATE INDEX idx_reply_votes_vote_type ON reply_votes(vote_type);

-- ============================================================================
-- 5. Function to update argument vote counts
-- ============================================================================

CREATE OR REPLACE FUNCTION update_argument_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update argument vote counts
  UPDATE arguments a
  SET
    upvotes = (
      SELECT COUNT(*) FROM argument_votes
      WHERE argument_id = COALESCE(NEW.argument_id, OLD.argument_id)
        AND vote_type = 'UP'
    ),
    downvotes = (
      SELECT COUNT(*) FROM argument_votes
      WHERE argument_id = COALESCE(NEW.argument_id, OLD.argument_id)
        AND vote_type = 'DOWN'
    )
  WHERE a.id = COALESCE(NEW.argument_id, OLD.argument_id);

  -- Update score (upvotes - downvotes)
  UPDATE arguments a
  SET score = upvotes - downvotes
  WHERE a.id = COALESCE(NEW.argument_id, OLD.argument_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Function to update reply vote counts
-- ============================================================================

CREATE OR REPLACE FUNCTION update_reply_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reply vote counts
  UPDATE argument_replies r
  SET
    upvotes = (
      SELECT COUNT(*) FROM reply_votes
      WHERE reply_id = COALESCE(NEW.reply_id, OLD.reply_id)
        AND vote_type = 'UP'
    ),
    downvotes = (
      SELECT COUNT(*) FROM reply_votes
      WHERE reply_id = COALESCE(NEW.reply_id, OLD.reply_id)
        AND vote_type = 'DOWN'
    )
  WHERE r.id = COALESCE(NEW.reply_id, OLD.reply_id);

  -- Update score (upvotes - downvotes)
  UPDATE argument_replies r
  SET score = upvotes - downvotes
  WHERE r.id = COALESCE(NEW.reply_id, OLD.reply_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Triggers for auto-updating vote counts
-- ============================================================================

CREATE TRIGGER trigger_update_argument_vote_count
AFTER INSERT OR UPDATE OR DELETE ON argument_votes
FOR EACH ROW
EXECUTE FUNCTION update_argument_vote_count();

CREATE TRIGGER trigger_update_reply_vote_count
AFTER INSERT OR UPDATE OR DELETE ON reply_votes
FOR EACH ROW
EXECUTE FUNCTION update_reply_vote_count();

-- ============================================================================
-- 8. Comments
-- ============================================================================

COMMENT ON TABLE argument_votes IS 'Reddit-style upvote/downvote for arguments';
COMMENT ON TABLE reply_votes IS 'Reddit-style upvote/downvote for replies';
COMMENT ON COLUMN arguments.score IS 'Karma score (upvotes - downvotes)';
COMMENT ON COLUMN argument_replies.score IS 'Karma score (upvotes - downvotes)';
