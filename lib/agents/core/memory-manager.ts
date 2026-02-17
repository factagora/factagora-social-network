// Agent Memory Management
// Handles loading, updating, and storing agent memory files

import { createAdminClient } from '@/lib/supabase/server'

/**
 * Memory file structure stored in agents.memory_files JSONB
 */
export interface AgentMemoryFiles {
  'Skills.MD'?: string
  'soul.md'?: string
  'memory.md'?: string
}

/**
 * Default memory file templates
 */
const DEFAULT_MEMORY_FILES: AgentMemoryFiles = {
  'Skills.MD': `# Skills

This file tracks my specialized capabilities and expertise areas.

## Core Competencies
- Evidence-based reasoning
- Source evaluation
- Fact-checking

## Learning History
(This section updates after each debate round)
`,

  'soul.md': `# Soul (Core Identity)

## Purpose
I am an AI agent designed to analyze predictions and contribute to evidence-based debates on Factagora.

## Values
- Truth-seeking above confirmation bias
- Rigorous source evaluation
- Transparent reasoning process
- Intellectual humility

## Communication Style
- Clear and structured arguments
- Evidence-backed claims
- Acknowledge uncertainties
- Respectful disagreement
`,

  'memory.md': `# Memory

This file tracks my experiences and learnings across debates.

## Recent Debates
(Updated after each round)

## Pattern Recognition
(Key insights from past debates)

## Improvement Areas
(Things I need to work on)
`,
}

/**
 * Load agent memory files from database
 */
export async function loadAgentMemory(agentId: string): Promise<AgentMemoryFiles> {
  const supabase = createAdminClient()

  const { data: agent, error } = await supabase
    .from('agents')
    .select('memory_files')
    .eq('id', agentId)
    .single()

  if (error) {
    console.error('Failed to load agent memory:', error)
    return DEFAULT_MEMORY_FILES
  }

  // If no memory files exist, return defaults
  if (!agent?.memory_files) {
    return DEFAULT_MEMORY_FILES
  }

  // Merge with defaults (in case some files are missing)
  return {
    ...DEFAULT_MEMORY_FILES,
    ...agent.memory_files,
  }
}

/**
 * Update agent memory after debate round
 */
export async function updateAgentMemory(
  agentId: string,
  learnings: {
    predictionTitle: string
    position: string
    confidence: number
    keyInsights: string[]
    mistakesMade?: string[]
    successfulStrategies?: string[]
  }
): Promise<void> {
  const supabase = createAdminClient()

  // Load current memory
  const memoryFiles = await loadAgentMemory(agentId)

  // Update memory.md with new learnings
  const timestamp = new Date().toISOString().split('T')[0]
  const newEntry = `
## ${timestamp} - ${learnings.predictionTitle}
**Position:** ${learnings.position} (Confidence: ${(learnings.confidence * 100).toFixed(0)}%)

### Key Insights
${learnings.keyInsights.map((insight) => `- ${insight}`).join('\n')}

${
  learnings.mistakesMade && learnings.mistakesMade.length > 0
    ? `### Mistakes to Avoid
${learnings.mistakesMade.map((mistake) => `- ${mistake}`).join('\n')}`
    : ''
}

${
  learnings.successfulStrategies && learnings.successfulStrategies.length > 0
    ? `### Successful Strategies
${learnings.successfulStrategies.map((strategy) => `- ${strategy}`).join('\n')}`
    : ''
}
`

  // Append to memory.md (keep last 10 entries)
  const updatedMemory = appendToMemory(memoryFiles['memory.md'] || '', newEntry, 10)

  const updatedMemoryFiles: AgentMemoryFiles = {
    ...memoryFiles,
    'memory.md': updatedMemory,
  }

  // Save to database
  const { error } = await supabase
    .from('agents')
    .update({ memory_files: updatedMemoryFiles })
    .eq('id', agentId)

  if (error) {
    console.error('Failed to update agent memory:', error)
    throw error
  }
}

/**
 * Append new entry to memory and keep only last N entries
 */
function appendToMemory(currentMemory: string, newEntry: string, maxEntries: number): string {
  const lines = currentMemory.split('\n')

  // Find "## Recent Debates" section
  const recentDebatesIndex = lines.findIndex((line) => line.includes('## Recent Debates'))

  if (recentDebatesIndex === -1) {
    // Section not found, append at the end
    return currentMemory + '\n' + newEntry
  }

  // Extract header and entries
  const header = lines.slice(0, recentDebatesIndex + 2).join('\n') // Include "## Recent Debates" + next line
  const existingEntries = lines.slice(recentDebatesIndex + 2).join('\n')

  // Split by date headers (##)
  const entryPattern = /^## \d{4}-\d{2}-\d{2}/gm
  const matches = [...existingEntries.matchAll(entryPattern)]
  const entries: string[] = []

  for (let i = 0; i < matches.length; i++) {
    const startIndex = matches[i].index!
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : existingEntries.length
    entries.push(existingEntries.slice(startIndex, endIndex).trim())
  }

  // Keep only last (maxEntries - 1) to make room for new entry
  const recentEntries = entries.slice(-Math.max(0, maxEntries - 1))

  // Combine: header + new entry + recent entries
  return [header, newEntry, ...recentEntries].join('\n\n').trim()
}

/**
 * Format memory files for system prompt injection
 */
export function formatMemoryForPrompt(memoryFiles: AgentMemoryFiles): string {
  const sections: string[] = []

  if (memoryFiles['soul.md']) {
    sections.push(`# Your Core Identity\n${memoryFiles['soul.md']}`)
  }

  if (memoryFiles['Skills.MD']) {
    sections.push(`# Your Skills & Capabilities\n${memoryFiles['Skills.MD']}`)
  }

  if (memoryFiles['memory.md']) {
    sections.push(`# Your Past Experiences\n${memoryFiles['memory.md']}`)
  }

  if (sections.length === 0) {
    return ''
  }

  return `
# Agent Memory Context

${sections.join('\n\n---\n\n')}

---

Use this context to inform your reasoning and avoid past mistakes. Build on successful strategies.
`
}
