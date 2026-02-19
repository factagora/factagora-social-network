// ============================================================================
// Database Helper Functions for Agent Skill System
// ============================================================================

import { createClient } from '@/lib/supabase/server';
import type {
  Skill,
  SkillRow,
  AgentSkillAssignment,
  AgentSkillAssignmentRow,
  SkillUsageLog,
  SkillUsageLogRow,
  SkillCategory,
  SkillStatistics,
  AgentSkillPerformance,
} from '@/src/types/skill';

// ============================================================================
// Helper Functions - Row to Model Conversion
// ============================================================================

/**
 * Convert database row to Skill model
 */
function rowToSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category as SkillCategory,
    version: row.version,
    author: row.author,
    provider: row.provider,
    capabilities: row.capabilities || {},
    requiredData: row.required_data || {},
    outputFormat: row.output_format || {},
    implementationType: row.implementation_type as any,
    implementationConfig: row.implementation_config || {},
    subscriptionRequirement: row.subscription_requirement as any,
    isActive: row.is_active,
    isBeta: row.is_beta,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert database row to AgentSkillAssignment model
 */
function rowToAssignment(row: AgentSkillAssignmentRow): AgentSkillAssignment {
  return {
    id: row.id,
    agentId: row.agent_id,
    skillId: row.skill_id,
    isEnabled: row.is_enabled,
    skillConfig: row.skill_config || {},
    usageCount: row.usage_count,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Convert database row to SkillUsageLog model
 */
function rowToUsageLog(row: SkillUsageLogRow): SkillUsageLog {
  return {
    id: row.id,
    agentId: row.agent_id,
    skillId: row.skill_id,
    predictionId: row.prediction_id,
    argumentId: row.argument_id,
    inputData: row.input_data || {},
    outputData: row.output_data,
    executionTimeMs: row.execution_time_ms,
    success: row.success,
    errorMessage: row.error_message,
    createdAt: new Date(row.created_at),
  };
}

// ============================================================================
// Skill CRUD Operations
// ============================================================================

/**
 * Get all active skills
 */
export async function getAllSkills(): Promise<Skill[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agent_skills')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching skills:', error);
    throw new Error(`Failed to fetch skills: ${error.message}`);
  }

  return (data || []).map(rowToSkill);
}

/**
 * Get skill by slug
 */
export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agent_skills')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching skill by slug:', error);
    throw new Error(`Failed to fetch skill: ${error.message}`);
  }

  return data ? rowToSkill(data) : null;
}

/**
 * Get skill by ID
 */
export async function getSkillById(id: string): Promise<Skill | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agent_skills')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching skill by ID:', error);
    throw new Error(`Failed to fetch skill: ${error.message}`);
  }

  return data ? rowToSkill(data) : null;
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(category: SkillCategory): Promise<Skill[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agent_skills')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching skills by category:', error);
    throw new Error(`Failed to fetch skills: ${error.message}`);
  }

  return (data || []).map(rowToSkill);
}

/**
 * Search skills by name or description
 */
export async function searchSkills(query: string): Promise<Skill[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agent_skills')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching skills:', error);
    throw new Error(`Failed to search skills: ${error.message}`);
  }

  return (data || []).map(rowToSkill);
}

// ============================================================================
// Agent Skill Assignment Operations
// ============================================================================

/**
 * Get all skills assigned to an agent
 */
export async function getAgentSkills(agentId: string): Promise<
  Array<{
    skill: Skill;
    assignment: AgentSkillAssignment;
  }>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agent_skill_assignments')
    .select(
      `
      *,
      skill:agent_skills!agent_skill_assignments_skill_id_fkey (*)
    `
    )
    .eq('agent_id', agentId)
    .eq('is_enabled', true);

  if (error) {
    console.error('Error fetching agent skills:', error);
    throw new Error(`Failed to fetch agent skills: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    skill: rowToSkill(row.skill),
    assignment: rowToAssignment(row),
  }));
}

/**
 * Check if an agent has a specific skill
 */
export async function agentHasSkill(agentId: string, skillSlug: string): Promise<boolean> {
  const supabase = await createClient();

  // First get skill ID from slug
  const { data: skillData } = await supabase
    .from('agent_skills')
    .select('id')
    .eq('slug', skillSlug)
    .single();

  if (!skillData) {
    return false;
  }

  const { data, error } = await supabase
    .from('agent_skill_assignments')
    .select('id')
    .eq('agent_id', agentId)
    .eq('skill_id', skillData.id)
    .eq('is_enabled', true)
    .single();

  return !!data && !error;
}

/**
 * Assign a skill to an agent
 */
export async function assignSkillToAgent(
  agentId: string,
  skillId: string,
  config?: Record<string, any>
): Promise<AgentSkillAssignment> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agent_skill_assignments')
    .insert({
      agent_id: agentId,
      skill_id: skillId,
      is_enabled: true,
      skill_config: config || {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error assigning skill to agent:', error);
    throw new Error(`Failed to assign skill: ${error.message}`);
  }

  return rowToAssignment(data);
}

/**
 * Remove a skill from an agent
 */
export async function removeSkillFromAgent(
  agentId: string,
  skillId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('agent_skill_assignments')
    .delete()
    .eq('agent_id', agentId)
    .eq('skill_id', skillId);

  if (error) {
    console.error('Error removing skill from agent:', error);
    throw new Error(`Failed to remove skill: ${error.message}`);
  }
}

/**
 * Update skill configuration for an agent
 */
export async function updateAgentSkillConfig(
  agentId: string,
  skillId: string,
  config: Record<string, any>
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('agent_skill_assignments')
    .update({ skill_config: config })
    .eq('agent_id', agentId)
    .eq('skill_id', skillId);

  if (error) {
    console.error('Error updating skill config:', error);
    throw new Error(`Failed to update skill config: ${error.message}`);
  }
}

/**
 * Enable or disable a skill for an agent
 */
export async function toggleAgentSkill(
  agentId: string,
  skillId: string,
  isEnabled: boolean
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('agent_skill_assignments')
    .update({ is_enabled: isEnabled })
    .eq('agent_id', agentId)
    .eq('skill_id', skillId);

  if (error) {
    console.error('Error toggling skill:', error);
    throw new Error(`Failed to toggle skill: ${error.message}`);
  }
}

// ============================================================================
// Skill Usage Logging
// ============================================================================

/**
 * Log skill usage
 */
export async function logSkillUsage(log: {
  agentId: string;
  skillId: string;
  predictionId?: string;
  argumentId?: string;
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  executionTimeMs?: number;
  success: boolean;
  errorMessage?: string;
}): Promise<SkillUsageLog> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('skill_usage_logs')
    .insert({
      agent_id: log.agentId,
      skill_id: log.skillId,
      prediction_id: log.predictionId || null,
      argument_id: log.argumentId || null,
      input_data: log.inputData,
      output_data: log.outputData || null,
      execution_time_ms: log.executionTimeMs || null,
      success: log.success,
      error_message: log.errorMessage || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging skill usage:', error);
    // Don't throw - logging failures shouldn't break the main flow
    throw new Error(`Failed to log skill usage: ${error.message}`);
  }

  return rowToUsageLog(data);
}

/**
 * Get usage logs for an agent
 */
export async function getAgentUsageLogs(
  agentId: string,
  limit: number = 50
): Promise<SkillUsageLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('skill_usage_logs')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching usage logs:', error);
    throw new Error(`Failed to fetch usage logs: ${error.message}`);
  }

  return (data || []).map(rowToUsageLog);
}

/**
 * Get usage logs for a skill
 */
export async function getSkillUsageLogs(
  skillId: string,
  limit: number = 50
): Promise<SkillUsageLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('skill_usage_logs')
    .select('*')
    .eq('skill_id', skillId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching skill usage logs:', error);
    throw new Error(`Failed to fetch usage logs: ${error.message}`);
  }

  return (data || []).map(rowToUsageLog);
}

// ============================================================================
// Statistics & Analytics
// ============================================================================

/**
 * Get statistics for all skills
 */
export async function getSkillStatistics(): Promise<SkillStatistics[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('skill_statistics').select('*');

  if (error) {
    console.error('Error fetching skill statistics:', error);
    throw new Error(`Failed to fetch skill statistics: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    skillId: row.skill_id,
    slug: row.slug,
    name: row.name,
    category: row.category as SkillCategory,
    provider: row.provider,
    agentsUsing: row.agents_using || 0,
    totalUses: row.total_uses || 0,
    successfulExecutions: row.successful_executions || 0,
    failedExecutions: row.failed_executions || 0,
    avgExecutionTimeMs: row.avg_execution_time_ms,
  }));
}

/**
 * Get performance metrics for an agent's skills
 */
export async function getAgentSkillPerformance(
  agentId: string
): Promise<AgentSkillPerformance[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agent_skill_performance')
    .select('*')
    .eq('agent_id', agentId);

  if (error) {
    console.error('Error fetching agent skill performance:', error);
    throw new Error(`Failed to fetch performance metrics: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    agentId: row.agent_id,
    agentName: row.agent_name,
    skillId: row.skill_id,
    skillName: row.skill_name,
    usageCount: row.usage_count || 0,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
    successfulUses: row.successful_uses || 0,
    failedUses: row.failed_uses || 0,
    avgExecutionTimeMs: row.avg_execution_time_ms,
  }));
}
