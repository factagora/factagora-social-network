/**
 * Integration Tests for Agent System (Phase 1)
 *
 * Tests:
 * 1. Memory loading and injection
 * 2. ReAct cycle storage
 * 3. Error handling and retry logic
 * 4. Round metadata storage
 * 5. Agent memory updates
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createClient } from '@supabase/supabase-js'

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Test data IDs (will be created in beforeAll)
let testAgentId: string
let testPredictionId: string
let testArgumentId: string

describe('Agent System Integration Tests', () => {
  // Setup: Create test agent and prediction
  beforeAll(async () => {
    // Create test agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        name: 'Test Agent (Integration)',
        description: 'Integration test agent',
        mode: 'MANAGED',
        personality: 'DATA_ANALYST',
        temperature: 0.5,
        is_active: false, // Keep inactive to avoid interference
        model: 'claude-3-5-sonnet-20241022',
      })
      .select()
      .single()

    expect(agentError).toBeNull()
    expect(agent).toBeTruthy()
    testAgentId = agent!.id

    // Create test prediction
    const { data: prediction, error: predError } = await supabase
      .from('predictions')
      .insert({
        title: 'Test Prediction (Integration)',
        description: 'Integration test prediction',
        category: 'tech',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    expect(predError).toBeNull()
    expect(prediction).toBeTruthy()
    testPredictionId = prediction!.id

    console.log('✅ Test setup complete')
    console.log(`   Agent ID: ${testAgentId}`)
    console.log(`   Prediction ID: ${testPredictionId}`)
  })

  // Cleanup: Delete test data
  afterAll(async () => {
    // Delete in correct order (respect foreign keys)
    if (testArgumentId) {
      await supabase.from('agent_react_cycles').delete().eq('argument_id', testArgumentId)
      await supabase.from('arguments').delete().eq('id', testArgumentId)
    }

    if (testPredictionId) {
      await supabase.from('debate_rounds_metadata').delete().eq('prediction_id', testPredictionId)
      await supabase.from('debate_rounds_failures').delete().eq('prediction_id', testPredictionId)
      await supabase.from('debate_rounds').delete().eq('prediction_id', testPredictionId)
      await supabase.from('predictions').delete().eq('id', testPredictionId)
    }

    if (testAgentId) {
      await supabase.from('agents').delete().eq('id', testAgentId)
    }

    console.log('✅ Test cleanup complete')
  })

  describe('1. Memory System', () => {
    it('should have memory_files column in agents table', async () => {
      const { data: agent, error } = await supabase
        .from('agents')
        .select('memory_files')
        .eq('id', testAgentId)
        .single()

      expect(error).toBeNull()
      expect(agent).toBeTruthy()
      expect(agent!.memory_files).toBeDefined()
    })

    it('should initialize memory_files with default values', async () => {
      const { data: agent, error } = await supabase
        .from('agents')
        .select('memory_files')
        .eq('id', testAgentId)
        .single()

      expect(error).toBeNull()

      const memoryFiles = agent!.memory_files as any
      expect(memoryFiles).toBeTruthy()
      expect(memoryFiles['Skills.MD']).toBeTruthy()
      expect(memoryFiles['soul.md']).toBeTruthy()
      expect(memoryFiles['memory.md']).toBeTruthy()
    })

    it('should update memory_files', async () => {
      const updatedMemory = {
        'Skills.MD': '# Updated Skills',
        'soul.md': '# Updated Soul',
        'memory.md': '# Updated Memory\n\n## Recent Learnings\n- Test learning 1',
      }

      const { error } = await supabase
        .from('agents')
        .update({ memory_files: updatedMemory })
        .eq('id', testAgentId)

      expect(error).toBeNull()

      // Verify update
      const { data: agent } = await supabase
        .from('agents')
        .select('memory_files')
        .eq('id', testAgentId)
        .single()

      expect(agent!.memory_files).toEqual(updatedMemory)
    })
  })

  describe('2. ReAct Cycle Storage', () => {
    it('should have agent_react_cycles table', async () => {
      const { data, error } = await supabase
        .from('agent_react_cycles')
        .select('id')
        .limit(1)

      // Should not error (table exists)
      expect(error).toBeNull()
    })

    it('should store complete ReAct cycle', async () => {
      // First create an argument
      const { data: argument, error: argError } = await supabase
        .from('arguments')
        .insert({
          prediction_id: testPredictionId,
          author_id: testAgentId,
          author_type: 'AI_AGENT',
          author_name: 'Test Agent',
          position: 'YES',
          content: 'Test argument content',
          evidence: [],
          confidence: 0.75,
          round_number: 1,
        })
        .select()
        .single()

      expect(argError).toBeNull()
      expect(argument).toBeTruthy()
      testArgumentId = argument!.id

      // Store ReAct cycle
      const { data: cycle, error: cycleError } = await supabase
        .from('agent_react_cycles')
        .insert({
          argument_id: testArgumentId,
          agent_id: testAgentId,
          prediction_id: testPredictionId,
          initial_thought: 'Test initial thought',
          hypothesis: 'Test hypothesis',
          information_needs: ['Need 1', 'Need 2'],
          actions: [
            {
              type: 'web_search',
              query: 'Test query',
              result: 'Test result',
              source: 'https://example.com',
              reliability: 0.8,
            },
          ],
          observations: ['Observation 1', 'Observation 2'],
          source_validation: [
            { source: 'https://example.com', reliability: 0.8 },
          ],
          synthesis_thought: 'Test synthesis',
          counter_arguments_considered: ['Counter 1'],
          confidence_adjustment: 0.1,
          round_number: 1,
          thinking_depth: 'detailed',
        })
        .select()
        .single()

      expect(cycleError).toBeNull()
      expect(cycle).toBeTruthy()
      expect(cycle!.initial_thought).toBe('Test initial thought')
      expect(cycle!.actions).toHaveLength(1)
      expect(cycle!.observations).toHaveLength(2)
    })

    it('should retrieve ReAct cycle by argument', async () => {
      const { data, error } = await supabase.rpc('get_react_cycle_by_argument', {
        p_argument_id: testArgumentId,
      })

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data).toHaveLength(1)
      expect(data![0].initial_thought).toBe('Test initial thought')
    })
  })

  describe('3. Round Metadata Storage', () => {
    it('should have debate_rounds_metadata table', async () => {
      const { data, error } = await supabase
        .from('debate_rounds_metadata')
        .select('id')
        .limit(1)

      expect(error).toBeNull()
    })

    it('should store round metadata', async () => {
      const { data: metadata, error } = await supabase
        .from('debate_rounds_metadata')
        .insert({
          prediction_id: testPredictionId,
          round_number: 1,
          agents_participated: 5,
          successful_responses: 4,
          failed_agents: ['Failed Agent'],
          consensus_score: 0.75,
          position_distribution: { YES: 3, NO: 1, NEUTRAL: 0 },
          duration_ms: 5000,
          avg_response_time_ms: 1250,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(metadata).toBeTruthy()
      expect(metadata!.agents_participated).toBe(5)
      expect(metadata!.successful_responses).toBe(4)
    })
  })

  describe('4. Failure Logging', () => {
    it('should have debate_rounds_failures table', async () => {
      const { data, error } = await supabase
        .from('debate_rounds_failures')
        .select('id')
        .limit(1)

      expect(error).toBeNull()
    })

    it('should log agent failures', async () => {
      const { data: failure, error } = await supabase
        .from('debate_rounds_failures')
        .insert({
          prediction_id: testPredictionId,
          round_number: 1,
          agent_id: testAgentId,
          agent_name: 'Test Agent',
          error_type: 'TIMEOUT',
          error_message: 'Agent timeout after 30s',
          retry_attempt: 3,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(failure).toBeTruthy()
      expect(failure!.error_type).toBe('TIMEOUT')
      expect(failure!.retry_attempt).toBe(3)
    })
  })

  describe('5. API Endpoints', () => {
    it('should retrieve ReAct cycle via API', async () => {
      // This would require the Next.js app to be running
      // For now, we test the database function directly
      const { data, error } = await supabase.rpc('get_react_cycle_by_argument', {
        p_argument_id: testArgumentId,
      })

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data).toHaveLength(1)
    })
  })

  describe('6. Data Integrity', () => {
    it('should enforce foreign key constraints', async () => {
      // Try to create ReAct cycle with non-existent argument
      const { error } = await supabase.from('agent_react_cycles').insert({
        argument_id: '00000000-0000-0000-0000-000000000000',
        agent_id: testAgentId,
        initial_thought: 'Test',
        actions: [],
        observations: [],
        synthesis_thought: 'Test',
        round_number: 1,
      })

      // Should fail with foreign key violation
      expect(error).toBeTruthy()
      expect(error!.code).toContain('23503') // Foreign key violation
    })

    it('should cascade delete ReAct cycles when argument is deleted', async () => {
      // Count cycles before
      const { count: beforeCount } = await supabase
        .from('agent_react_cycles')
        .select('id', { count: 'exact' })
        .eq('argument_id', testArgumentId)

      expect(beforeCount).toBeGreaterThan(0)

      // Delete argument (should cascade to ReAct cycle)
      const { error: deleteError } = await supabase
        .from('arguments')
        .delete()
        .eq('id', testArgumentId)

      expect(deleteError).toBeNull()

      // Count cycles after
      const { count: afterCount } = await supabase
        .from('agent_react_cycles')
        .select('id', { count: 'exact' })
        .eq('argument_id', testArgumentId)

      expect(afterCount).toBe(0)

      // Clear testArgumentId so cleanup doesn't fail
      testArgumentId = ''
    })
  })
})
