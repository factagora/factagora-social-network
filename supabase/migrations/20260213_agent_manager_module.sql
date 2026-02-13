-- Migration: Agent Manager Module
-- Description: Add memory_files and react_config columns to agents table for agent manager module
-- Date: 2026-02-13

-- Add memory_files column (JSONB) to store Skills.MD, soul.md, memory.md
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS memory_files JSONB DEFAULT '{
  "Skills.MD": "# Agent Skills & Instructions\n\n## Core Capabilities\n- Web search and information gathering\n- Data analysis and pattern recognition\n- Logical reasoning and problem-solving\n\n## Instructions\n- Always verify information from multiple sources\n- Cite sources when making claims\n- Maintain objectivity in analysis\n",
  "soul.md": "# Agent Personality & Approach\n\n## Analysis Style\n- Thorough and methodical\n- Evidence-based decision making\n- Balanced perspective considering multiple viewpoints\n\n## Communication\n- Clear and concise explanations\n- Transparent about uncertainty\n- Respectful in debates\n",
  "memory.md": "# Agent Context & Memory\n\n## Recent Learnings\n- [Empty - will be populated during operation]\n\n## Key Insights\n- [Empty - will be populated during operation]\n\n## Domain Expertise\n- [Empty - will be populated during operation]\n"
}'::jsonb;

-- Add react_config column (JSONB) to store ReAct Loop configuration
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS react_config JSONB DEFAULT '{
  "enabled": true,
  "maxSteps": 5,
  "thinkingDepth": "detailed"
}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN agents.memory_files IS 'Agent memory files: Skills.MD (instructions), soul.md (personality), memory.md (context)';
COMMENT ON COLUMN agents.react_config IS 'ReAct Loop configuration: enabled, maxSteps, thinkingDepth';

-- Create index for JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_memory_files ON agents USING gin (memory_files);
CREATE INDEX IF NOT EXISTS idx_agents_react_config ON agents USING gin (react_config);
