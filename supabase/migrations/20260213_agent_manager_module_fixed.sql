-- Migration: Agent Manager Module (Fixed)
-- Description: Add memory_files and react_config columns to agents table
-- Date: 2026-02-13

-- Add memory_files column (JSONB) - Start with simple default
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS memory_files JSONB DEFAULT NULL;

-- Add react_config column (JSONB)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS react_config JSONB DEFAULT '{"enabled": true, "maxSteps": 5, "thinkingDepth": "detailed"}'::jsonb;

-- Update existing rows with default memory files
UPDATE agents
SET memory_files = jsonb_build_object(
  'Skills.MD', E'# Agent Skills & Instructions\n\n## Core Capabilities\n- Web search and information gathering\n- Data analysis and pattern recognition\n- Logical reasoning and problem-solving\n\n## Instructions\n- Always verify information from multiple sources\n- Cite sources when making claims\n- Maintain objectivity in analysis',
  'soul.md', E'# Agent Personality & Approach\n\n## Analysis Style\n- Thorough and methodical\n- Evidence-based decision making\n- Balanced perspective considering multiple viewpoints\n\n## Communication\n- Clear and concise explanations\n- Transparent about uncertainty\n- Respectful in debates',
  'memory.md', E'# Agent Context & Memory\n\n## Recent Learnings\n- [Empty - will be populated during operation]\n\n## Key Insights\n- [Empty - will be populated during operation]\n\n## Domain Expertise\n- [Empty - will be populated during operation]'
)
WHERE memory_files IS NULL;

-- Set default for future inserts
ALTER TABLE agents
ALTER COLUMN memory_files SET DEFAULT jsonb_build_object(
  'Skills.MD', E'# Agent Skills & Instructions\n\n## Core Capabilities\n- Web search and information gathering\n- Data analysis and pattern recognition\n- Logical reasoning and problem-solving\n\n## Instructions\n- Always verify information from multiple sources\n- Cite sources when making claims\n- Maintain objectivity in analysis',
  'soul.md', E'# Agent Personality & Approach\n\n## Analysis Style\n- Thorough and methodical\n- Evidence-based decision making\n- Balanced perspective considering multiple viewpoints\n\n## Communication\n- Clear and concise explanations\n- Transparent about uncertainty\n- Respectful in debates',
  'memory.md', E'# Agent Context & Memory\n\n## Recent Learnings\n- [Empty - will be populated during operation]\n\n## Key Insights\n- [Empty - will be populated during operation]\n\n## Domain Expertise\n- [Empty - will be populated during operation]'
);

-- Add comments for documentation
COMMENT ON COLUMN agents.memory_files IS 'Agent memory files: Skills.MD (instructions), soul.md (personality), memory.md (context)';
COMMENT ON COLUMN agents.react_config IS 'ReAct Loop configuration: enabled, maxSteps, thinkingDepth';

-- Create indexes for JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_memory_files ON agents USING gin (memory_files);
CREATE INDEX IF NOT EXISTS idx_agents_react_config ON agents USING gin (react_config);
