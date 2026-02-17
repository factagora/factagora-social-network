-- ============================================================================
-- NOTIFICATIONS SYSTEM
-- ============================================================================
-- Flexible notification system for user alerts and updates
-- Supports real-time notifications via Supabase Realtime

-- ============================================================================
-- NOTIFICATION TYPES ENUM
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'factblock_resolved',      -- Your prediction/claim was resolved
    'new_argument',            -- New argument on your factblock
    'new_vote',                -- Factblock you voted on was resolved
    'argument_reply',          -- Someone replied to your argument (V2)
    'mention',                 -- Someone mentioned you (V2)
    'follow'                   -- Someone followed you (V2)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification Type
  type notification_type NOT NULL,

  -- Related FactBlock (if applicable)
  factblock_id UUID,
  factblock_type VARCHAR(20) CHECK (factblock_type IN ('prediction', 'claim')),
  factblock_title TEXT,

  -- Actor (person who triggered the notification)
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT,

  -- Message
  message TEXT NOT NULL,

  -- Metadata (JSON for flexible data)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Status
  read BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,

  -- Indexes
  CONSTRAINT notifications_user_factblock_idx
    CHECK (factblock_id IS NULL OR factblock_type IS NOT NULL)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_factblock ON notifications(factblock_id, factblock_type);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: System can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================
-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================================
-- HELPER FUNCTION: Mark notification as read
-- ============================================================================
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET
    read = TRUE,
    read_at = NOW()
  WHERE id = notification_id
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Mark all notifications as read
-- ============================================================================
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE notifications
  SET
    read = TRUE,
    read_at = NOW()
  WHERE user_id = auth.uid()
    AND read = FALSE;

  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Get unread notification count
-- ============================================================================
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = auth.uid()
      AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE notifications IS 'User notifications for various events';
COMMENT ON COLUMN notifications.user_id IS 'User receiving the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification event';
COMMENT ON COLUMN notifications.factblock_id IS 'Related prediction or claim ID';
COMMENT ON COLUMN notifications.factblock_type IS 'Type of factblock: prediction or claim';
COMMENT ON COLUMN notifications.actor_id IS 'User who triggered the notification';
COMMENT ON COLUMN notifications.message IS 'Human-readable notification message';
COMMENT ON COLUMN notifications.metadata IS 'Additional flexible data in JSON format';
COMMENT ON COLUMN notifications.read IS 'Whether notification has been read';
