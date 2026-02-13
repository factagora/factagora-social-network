import { createAdminClient } from '@/lib/supabase/server'
import type { AgentMode, PersonalityType } from '@/src/types/debate'

export interface AgentCreateInput {
  userId: string
  mode: AgentMode
  name: string
  description?: string
  // MANAGED fields
  personality?: PersonalityType
  temperature?: number
  model?: string
  // BYOA fields
  webhookUrl?: string
  authToken?: string
  // Agent Manager fields
  reactConfig?: {
    enabled: boolean
    maxSteps: number
    thinkingDepth: 'basic' | 'detailed' | 'comprehensive'
  }
  memoryFiles?: {
    'Skills.MD': string
    'soul.md': string
    'memory.md': string
  }
  debateSchedule?: 'hourly' | 'twice_daily' | 'daily' | 'weekly' | 'manual'
  debateCategories?: string[] | null
  minConfidence?: number
}

export interface AgentUpdateInput {
  name?: string
  description?: string
  personality?: PersonalityType
  temperature?: number
  model?: string
  isActive?: boolean
  // Debate configuration
  debateEnabled?: boolean
  debateSchedule?: 'hourly' | 'twice_daily' | 'daily' | 'weekly' | 'manual'
  debateCategories?: string[] | null
  minConfidence?: number
  autoParticipate?: boolean
}

export interface AgentRow {
  id: string
  user_id: string
  mode: string
  name: string
  description: string | null
  personality: string | null
  temperature: number | null
  model: string | null
  webhook_url: string | null
  webhook_auth_token: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  subscription_tier: string
  subscription_status: string
  total_react_cycles: number
  avg_evidence_quality: number
}

/**
 * Create a new agent
 */
export async function createAgent(input: AgentCreateInput) {
  const supabase = createAdminClient()

  const agentData: any = {
    user_id: input.userId,
    mode: input.mode,
    name: input.name,
    description: input.description || null,
    is_active: true,
    // Agent Manager fields
    react_config: input.reactConfig || null,
    memory_files: input.memoryFiles || null,
    debate_schedule: input.debateSchedule || 'daily',
    debate_categories: input.debateCategories || null,
    min_confidence: input.minConfidence || 0.5,
  }

  if (input.mode === 'MANAGED') {
    agentData.personality = input.personality
    agentData.temperature = input.temperature ?? 0.7
    agentData.model = input.model || 'claude-sonnet-4-5'
  } else if (input.mode === 'BYOA') {
    agentData.webhook_url = input.webhookUrl
    agentData.webhook_auth_token = input.authToken
    agentData.personality = input.personality || null
    agentData.temperature = input.temperature || null
  }

  const { data, error } = await supabase
    .from('agents')
    .insert(agentData)
    .select()
    .single()

  if (error) {
    console.error('Error creating agent:', error)
    throw error
  }

  return data as AgentRow
}

/**
 * Get all agents for a user
 */
export async function getUserAgents(userId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user agents:', error)
    throw error
  }

  return data as AgentRow[]
}

/**
 * Get a single agent by ID
 */
export async function getAgentById(agentId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single()

  if (error) {
    console.error('Error fetching agent:', error)
    throw error
  }

  return data as AgentRow
}

/**
 * Get all active agents (for execution)
 */
export async function getActiveAgents() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active agents:', error)
    throw error
  }

  return data as AgentRow[]
}

/**
 * Update an agent
 */
export async function updateAgent(agentId: string, userId: string, input: AgentUpdateInput) {
  const supabase = createAdminClient()

  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.personality !== undefined) updateData.personality = input.personality
  if (input.temperature !== undefined) updateData.temperature = input.temperature
  if (input.model !== undefined) updateData.model = input.model
  if (input.isActive !== undefined) updateData.is_active = input.isActive

  // Debate configuration
  if (input.debateEnabled !== undefined) updateData.debate_enabled = input.debateEnabled
  if (input.debateSchedule !== undefined) updateData.debate_schedule = input.debateSchedule
  if (input.debateCategories !== undefined) updateData.debate_categories = input.debateCategories
  if (input.minConfidence !== undefined) updateData.min_confidence = input.minConfidence
  if (input.autoParticipate !== undefined) updateData.auto_participate = input.autoParticipate

  const { data, error } = await supabase
    .from('agents')
    .update(updateData)
    .eq('id', agentId)
    .eq('user_id', userId) // Ensure user owns the agent
    .select()
    .single()

  if (error) {
    console.error('Error updating agent:', error)
    throw error
  }

  return data as AgentRow
}

/**
 * Delete an agent (only if inactive)
 */
export async function deleteAgent(agentId: string, userId: string) {
  const supabase = createAdminClient()

  // First check if agent is inactive
  const { data: agent, error: fetchError } = await supabase
    .from('agents')
    .select('is_active')
    .eq('id', agentId)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    console.error('Error fetching agent for deletion:', fetchError)
    throw fetchError
  }

  if (agent.is_active) {
    throw new Error('Cannot delete active agent. Deactivate it first.')
  }

  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting agent:', error)
    throw error
  }

  return { success: true }
}

/**
 * Get agent with statistics
 */
export async function getAgentWithStats(agentId: string) {
  const supabase = createAdminClient()

  // Get agent data
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single()

  if (agentError) {
    console.error('Error fetching agent:', agentError)
    throw agentError
  }

  // Get statistics from arguments
  const { data: stats, error: statsError } = await supabase
    .from('arguments')
    .select('confidence, position')
    .eq('author_id', agentId)
    .eq('author_type', 'AI_AGENT')

  if (statsError) {
    console.error('Error fetching agent stats:', statsError)
    // Don't throw, just return agent without stats
    return {
      ...agent,
      stats: {
        totalPredictions: 0,
        avgConfidence: 0,
        accuracy: 0,
      },
    }
  }

  const totalPredictions = stats?.length || 0
  const avgConfidence = totalPredictions > 0
    ? stats!.reduce((sum, s) => sum + (s.confidence || 0), 0) / totalPredictions
    : 0

  return {
    ...agent,
    stats: {
      totalPredictions,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      accuracy: 0, // TODO: Calculate based on resolved predictions
    },
  }
}
