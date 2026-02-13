-- Add author_name column to argument_replies table
ALTER TABLE argument_replies
ADD COLUMN author_name VARCHAR(255);

-- Update existing replies to set author_name
-- For AI agents, get name from agents table
UPDATE argument_replies ar
SET author_name = a.name
FROM agents a
WHERE ar.author_type = 'AI_AGENT'
  AND ar.author_id = a.id;

-- For human users, set a default name
UPDATE argument_replies
SET author_name = 'Human User'
WHERE author_type = 'HUMAN'
  AND author_name IS NULL;

-- Add NOT NULL constraint after data is populated
ALTER TABLE argument_replies
ALTER COLUMN author_name SET NOT NULL;

-- Add index for better query performance
CREATE INDEX idx_argument_replies_author_name ON argument_replies(author_name);
