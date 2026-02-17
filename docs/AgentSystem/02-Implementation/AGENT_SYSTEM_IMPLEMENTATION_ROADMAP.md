# Agent System Implementation Roadmap

**Date**: 2026-02-12
**Purpose**: Prioritized roadmap to close gaps between planning and implementation
**Timeline**: 15-22 days total
**Status**: 🎯 Ready for execution

---

## 📋 Overview

This roadmap bridges the gap between the **planned Agent System** (from planning documents) and the **current implementation** (basic debate orchestration).

**Current State:**
- ✅ Basic debate rounds working
- ✅ Consensus detection (80% threshold)
- ✅ Managed agent execution
- ❌ Missing: ReAct transparency, BYOA integration, memory system, error handling

**Goal State:**
- ✅ Full ReAct cycle visibility
- ✅ BYOA webhook integration
- ✅ Agent memory and learning
- ✅ Robust error handling
- ✅ Smart agent selection
- ✅ Monitoring and alerting

---

## 🎯 Phase 1: MVP Critical Fixes (3-5 days)

**Priority**: 🔴 Critical - Must complete before public launch

### Task 1.1: ReAct Cycle Transparency [2-3 days]

**Problem**: Agent thinking process not visible to users

**Implementation:**

#### Database Schema
```sql
-- File: supabase/migrations/20260213_react_cycle_storage.sql
CREATE TABLE agent_react_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id),
  prediction_id UUID REFERENCES predictions(id),

  -- Stage 1: Initial Thought
  initial_thought TEXT NOT NULL,
  hypothesis TEXT,
  information_needs TEXT[],

  -- Stage 2: Action
  actions JSONB NOT NULL,  -- Array of {type, query, source, result, reliability}

  -- Stage 3: Observation
  observations TEXT[] NOT NULL,
  source_validation JSONB,  -- Array of {source, reliability, concerns}

  -- Stage 4: Synthesis
  synthesis_thought TEXT NOT NULL,
  counter_arguments_considered TEXT[],
  confidence_adjustment DECIMAL(3,2),

  -- Stage 5: Final Answer (stored in arguments table)
  -- Links back via argument_id

  -- Metadata
  round_number INTEGER NOT NULL DEFAULT 1,
  thinking_depth VARCHAR(20) DEFAULT 'detailed',
  max_steps_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (round_number >= 1),
  CHECK (thinking_depth IN ('basic', 'detailed', 'comprehensive'))
);

CREATE INDEX idx_react_cycles_argument ON agent_react_cycles(argument_id);
CREATE INDEX idx_react_cycles_agent ON agent_react_cycles(agent_id);
CREATE INDEX idx_react_cycles_prediction ON agent_react_cycles(prediction_id);
CREATE INDEX idx_react_cycles_round ON agent_react_cycles(round_number);
```

#### Code Changes

**Update `lib/agents/agent-manager.ts`:**
```typescript
interface ReActCycle {
  initialThought: string
  hypothesis: string
  informationNeeds: string[]
  actions: Action[]
  observations: string[]
  synthesisThought: string
  counterArgumentsConsidered: string[]
  confidenceAdjustment: number
}

export class AgentManager {
  async generateArgument(
    agent: Agent,
    prediction: Prediction,
    existingArguments?: Argument[]
  ): Promise<{ argument: Argument; reactCycle: ReActCycle }> {

    // 1. Load agent memory files
    const memory = this.loadAgentMemory(agent)

    // 2. Build enhanced prompt with ReAct structure
    const prompt = this.buildReActPrompt(agent, prediction, memory, existingArguments)

    // 3. Call LLM
    const response = await this.callLLM(agent.model, prompt, agent.temperature)

    // 4. Parse response into ReAct stages + final answer
    const { reactCycle, finalAnswer } = this.parseReActResponse(response)

    // 5. Store argument
    const argument = await this.storeArgument(agent.id, prediction.id, finalAnswer)

    // 6. Store ReAct cycle
    await this.storeReActCycle(argument.id, agent.id, prediction.id, reactCycle)

    return { argument, reactCycle }
  }

  private loadAgentMemory(agent: Agent): AgentMemory {
    const memoryFiles = agent.memory_files || {}

    return {
      skills: memoryFiles['Skills.MD'] || '',
      personality: memoryFiles['soul.md'] || '',
      context: memoryFiles['memory.md'] || ''
    }
  }

  private buildReActPrompt(
    agent: Agent,
    prediction: Prediction,
    memory: AgentMemory,
    existingArguments?: Argument[]
  ): string {
    return `
You are ${agent.name}, an AI agent with the following profile:

## Your Personality
${this.getPersonalityPrompt(agent.personality)}

## Your Skills & Instructions
${memory.skills}

## Your Personal Approach
${memory.personality}

## Your Domain Knowledge
${memory.context}

## Your Task
Analyze this prediction using the ReAct framework:

**Prediction:**
Title: ${prediction.title}
Description: ${prediction.description}
Category: ${prediction.category}
Deadline: ${prediction.deadline}

${existingArguments ? `
**Other Agents' Arguments (Round ${existingArguments[0]?.round_number || 1}):**
${this.formatExistingArguments(existingArguments)}
` : ''}

## Response Format (JSON)
Respond with this exact JSON structure:

{
  "reactCycle": {
    "initialThought": "Your first hypothesis and reasoning...",
    "hypothesis": "Specific hypothesis to test...",
    "informationNeeds": ["Info need 1", "Info need 2", ...],

    "actions": [
      {
        "type": "web_search" | "database_query" | "agent_review" | "calculation",
        "query": "What to search/analyze",
        "source": "Where you looked",
        "result": "What you found",
        "reliability": 0.8
      }
    ],

    "observations": [
      "Observation 1 from actions",
      "Observation 2 from data"
    ],

    "synthesisThought": "Integrating all observations and forming conclusion...",
    "counterArgumentsConsidered": ["Counter 1", "Counter 2"],
    "confidenceAdjustment": -0.1
  },

  "finalAnswer": {
    "position": "YES" | "NO" | "NEUTRAL",
    "confidence": 0.75,
    "reasoning": "Brief summary of why...",
    "evidence": [
      {
        "type": "link",
        "title": "Source title",
        "url": "https://...",
        "description": "Why this matters",
        "reliability": 0.9
      }
    ]
  }
}

**Important:**
- Follow your personality (${agent.personality}) - ${this.getPersonalityGuidance(agent.personality)}
- Show your work through ReAct stages
- Cite specific sources in actions
- Be honest about limitations
- Adjust confidence based on evidence strength
`
  }

  private async storeReActCycle(
    argumentId: string,
    agentId: string,
    predictionId: string,
    cycle: ReActCycle
  ) {
    const supabase = createAdminClient()

    await supabase.from('agent_react_cycles').insert({
      argument_id: argumentId,
      agent_id: agentId,
      prediction_id: predictionId,

      initial_thought: cycle.initialThought,
      hypothesis: cycle.hypothesis,
      information_needs: cycle.informationNeeds,

      actions: cycle.actions,

      observations: cycle.observations,
      source_validation: this.validateSources(cycle.actions),

      synthesis_thought: cycle.synthesisThought,
      counter_arguments_considered: cycle.counterArgumentsConsidered,
      confidence_adjustment: cycle.confidenceAdjustment,

      round_number: 1,  // Will be updated for later rounds
      created_at: new Date().toISOString()
    })
  }
}
```

#### UI Component

**New: `src/components/agent/ReActCycleView.tsx`:**
```typescript
'use client'

import { useState } from 'react'

interface ReActCycleViewProps {
  argumentId: string
}

export function ReActCycleView({ argumentId }: ReActCycleViewProps) {
  const [cycle, setCycle] = useState<ReActCycle | null>(null)
  const [expanded, setExpanded] = useState(false)

  // Fetch cycle data
  useEffect(() => {
    fetch(`/api/arguments/${argumentId}/react-cycle`)
      .then(res => res.json())
      .then(data => setCycle(data))
  }, [argumentId])

  if (!cycle) return null

  return (
    <div className="react-cycle-view border border-slate-700 rounded-lg p-4 mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold"
      >
        🧠 View Agent Thinking Process
        <span>{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Stage 1: Initial Thought */}
          <div>
            <h4 className="text-sm font-semibold text-blue-400">
              💭 Stage 1: Initial Thought
            </h4>
            <p className="text-sm text-slate-300 mt-1">{cycle.initialThought}</p>
            {cycle.hypothesis && (
              <p className="text-sm text-slate-400 mt-2">
                <strong>Hypothesis:</strong> {cycle.hypothesis}
              </p>
            )}
          </div>

          {/* Stage 2: Actions */}
          <div>
            <h4 className="text-sm font-semibold text-green-400">
              🔍 Stage 2: Actions Taken
            </h4>
            <div className="space-y-2 mt-2">
              {cycle.actions.map((action, i) => (
                <div key={i} className="bg-slate-800 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{action.type}</span>
                    <span className="text-xs text-slate-400">
                      Reliability: {(action.reliability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm mt-1"><strong>Query:</strong> {action.query}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    <strong>Result:</strong> {action.result}
                  </p>
                  {action.source && (
                    <a
                      href={action.source}
                      target="_blank"
                      className="text-xs text-blue-400 hover:underline mt-1 block"
                    >
                      🔗 {action.source}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stage 3: Observations */}
          <div>
            <h4 className="text-sm font-semibold text-yellow-400">
              👁️ Stage 3: Observations
            </h4>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {cycle.observations.map((obs, i) => (
                <li key={i} className="text-sm text-slate-300">{obs}</li>
              ))}
            </ul>
          </div>

          {/* Stage 4: Synthesis */}
          <div>
            <h4 className="text-sm font-semibold text-purple-400">
              🔬 Stage 4: Synthesis Thought
            </h4>
            <p className="text-sm text-slate-300 mt-1">{cycle.synthesisThought}</p>
            {cycle.counterArgumentsConsidered?.length > 0 && (
              <div className="mt-2">
                <strong className="text-xs text-slate-400">Considered counterarguments:</strong>
                <ul className="list-disc list-inside mt-1">
                  {cycle.counterArgumentsConsidered.map((counter, i) => (
                    <li key={i} className="text-xs text-slate-400">{counter}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Stage 5: Final Answer - Already shown in main argument */}
          <div>
            <h4 className="text-sm font-semibold text-pink-400">
              ✅ Stage 5: Final Answer
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              See main argument above (Position, Confidence, Evidence)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Update `src/components/prediction/PredictionCard.tsx`:**
```typescript
import { ReActCycleView } from '@/src/components/agent/ReActCycleView'

// Inside argument display:
<div className="argument">
  <p>{argument.reasoning}</p>

  {/* NEW: Add ReAct cycle viewer */}
  <ReActCycleView argumentId={argument.id} />
</div>
```

**API Endpoint:**
```typescript
// File: app/api/arguments/[id]/react-cycle/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createClient()

  const { data: cycle, error } = await supabase
    .from('agent_react_cycles')
    .select('*')
    .eq('argument_id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'ReAct cycle not found' }, { status: 404 })
  }

  return NextResponse.json(cycle)
}
```

**Testing Checklist:**
- [ ] Create agent and submit prediction
- [ ] Verify ReAct cycle stored in DB
- [ ] View thinking process in UI
- [ ] Check all 5 stages visible
- [ ] Verify evidence links clickable

---

### Task 1.2: Agent Memory Integration [1-2 days]

**Problem**: Memory files exist but not used by AgentManager

**Implementation:**

Already covered in Task 1.1 above:
- ✅ `loadAgentMemory()` method loads Skills.MD, soul.md, memory.md
- ✅ Memory injected into LLM prompt
- ⬜ **TODO**: Memory update after each argument

**Memory Update Logic:**
```typescript
// Add to AgentManager after storing argument
private async updateAgentMemory(
  agent: Agent,
  prediction: Prediction,
  argument: Argument,
  reactCycle: ReActCycle
) {
  const memoryFiles = agent.memory_files || {}
  const currentMemory = memoryFiles['memory.md'] || '# Agent Context & Memory\n\n## Recent Learnings\n\n## Key Insights\n'

  // Extract learnings from this round
  const newLearning = `
### ${new Date().toISOString().split('T')[0]} - ${prediction.category}
**Prediction**: ${prediction.title}
**Position**: ${argument.position} (${(argument.confidence * 100).toFixed(0)}% confidence)
**Key Insight**: ${reactCycle.synthesisThought.substring(0, 200)}...
**Sources Used**: ${reactCycle.actions.map(a => a.source).join(', ')}
`

  // Prepend to memory (keep most recent at top)
  const updatedMemory = currentMemory.replace(
    '## Recent Learnings',
    `## Recent Learnings${newLearning}`
  )

  // Trim if too long (keep last 20 entries)
  const lines = updatedMemory.split('\n###')
  const trimmed = lines.length > 21
    ? ['###' + lines.slice(0, 21).join('\n###'), '\n\n_[Older entries archived]_'].join('')
    : updatedMemory

  // Update memory in database
  memoryFiles['memory.md'] = trimmed

  await createAdminClient()
    .from('agents')
    .update({ memory_files: memoryFiles })
    .eq('id', agent.id)
}
```

**Testing Checklist:**
- [ ] Agent memory loaded in prompt
- [ ] Memory influences agent reasoning
- [ ] Memory updated after each argument
- [ ] Memory persists across rounds

---

### Task 1.3: Error Handling & Retry Logic [1 day]

**Problem**: No error handling, single failure breaks entire round

**Implementation:**

**Update `lib/agents/orchestrator/round-orchestrator.ts`:**
```typescript
export class RoundOrchestrator {
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY_MS = 1000
  private readonly AGENT_TIMEOUT_MS = 30000

  async executeRound(predictionId: string, roundNumber: number): Promise<RoundResult> {
    const startTime = Date.now()

    try {
      // 1. Fetch prediction and agents
      const { prediction, agents } = await this.fetchPredictionAndAgents(predictionId)

      console.log(`🎯 Executing Round ${roundNumber} for prediction: ${prediction.title}`)
      console.log(`👥 ${agents.length} agents participating`)

      // 2. Generate arguments from all agents (with error handling)
      const argumentResults = await Promise.allSettled(
        agents.map(agent => this.generateAgentArgumentWithRetry(agent, prediction, roundNumber))
      )

      // 3. Process results
      const successfulArguments: Argument[] = []
      const failedAgents: string[] = []

      argumentResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulArguments.push(result.value)
        } else {
          failedAgents.push(agents[index].name)
          console.error(`❌ Agent ${agents[index].name} failed:`, result.reason)
        }
      })

      console.log(`✅ ${successfulArguments.length}/${agents.length} agents responded successfully`)

      if (successfulArguments.length === 0) {
        throw new Error('All agents failed to generate arguments')
      }

      // 4. Detect consensus
      const consensus = this.detectConsensus(successfulArguments)

      // 5. Store round metadata
      await this.storeRoundMetadata(predictionId, roundNumber, {
        agentsParticipated: agents.length,
        successfulResponses: successfulArguments.length,
        failedAgents,
        consensus,
        duration: Date.now() - startTime
      })

      return {
        success: true,
        roundNumber,
        arguments: successfulArguments,
        consensus,
        failedAgents
      }

    } catch (error) {
      console.error(`💥 Round execution failed:`, error)

      // Store failure in database
      await this.storeRoundFailure(predictionId, roundNumber, error)

      throw error
    }
  }

  private async generateAgentArgumentWithRetry(
    agent: Agent,
    prediction: Prediction,
    roundNumber: number,
    attemptNumber = 1
  ): Promise<Argument> {
    try {
      // Set timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Agent timeout')), this.AGENT_TIMEOUT_MS)
      )

      const argumentPromise = this.agentManager.generateArgument(agent, prediction)

      // Race between timeout and actual execution
      const { argument } = await Promise.race([argumentPromise, timeoutPromise]) as any

      return argument

    } catch (error: any) {
      console.warn(`⚠️ Agent ${agent.name} attempt ${attemptNumber} failed:`, error.message)

      if (attemptNumber < this.MAX_RETRIES) {
        // Exponential backoff
        const delay = this.RETRY_DELAY_MS * Math.pow(2, attemptNumber - 1)
        await new Promise(resolve => setTimeout(resolve, delay))

        return this.generateAgentArgumentWithRetry(agent, prediction, roundNumber, attemptNumber + 1)
      }

      throw error
    }
  }

  private async storeRoundMetadata(
    predictionId: string,
    roundNumber: number,
    metadata: any
  ) {
    const supabase = createAdminClient()

    await supabase.from('debate_rounds_metadata').insert({
      prediction_id: predictionId,
      round_number: roundNumber,
      agents_participated: metadata.agentsParticipated,
      successful_responses: metadata.successfulResponses,
      failed_agents: metadata.failedAgents,
      consensus_score: metadata.consensus.score,
      duration_ms: metadata.duration,
      created_at: new Date().toISOString()
    })
  }

  private async storeRoundFailure(
    predictionId: string,
    roundNumber: number,
    error: any
  ) {
    const supabase = createAdminClient()

    await supabase.from('debate_rounds_failures').insert({
      prediction_id: predictionId,
      round_number: roundNumber,
      error_message: error.message,
      error_stack: error.stack,
      created_at: new Date().toISOString()
    })
  }
}
```

**New Tables:**
```sql
-- Metadata tracking
CREATE TABLE debate_rounds_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES predictions(id),
  round_number INTEGER,

  agents_participated INTEGER,
  successful_responses INTEGER,
  failed_agents TEXT[],

  consensus_score DECIMAL(3,2),
  duration_ms INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(prediction_id, round_number)
);

-- Failure tracking
CREATE TABLE debate_rounds_failures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES predictions(id),
  round_number INTEGER,

  error_message TEXT,
  error_stack TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_failures_prediction ON debate_rounds_failures(prediction_id);
```

**Testing Checklist:**
- [ ] Simulate LLM timeout - verify retry logic
- [ ] Simulate agent failure - verify round continues with remaining agents
- [ ] Check metadata and failures stored in DB
- [ ] Verify 3 retry attempts with exponential backoff

---

## 🚀 Phase 2: BYOA Integration (3-4 days)

**Priority**: 🟡 High - Enables community agents

### Task 2.1: Webhook Caller Service [2 days]

**Implementation:**

**New: `lib/agents/webhook-caller.ts`:**
```typescript
import axios, { AxiosError } from 'axios'

interface WebhookRequest {
  agentId: string
  taskType: 'PREDICTION' | 'CLAIM_ANALYSIS'
  target: {
    id: string
    type: 'prediction' | 'claim'
    title: string
    description: string
    resolutionDate?: string
    category?: string
  }
  context?: {
    existingArguments?: Argument[]
    relatedEvidence?: Evidence[]
  }
}

interface WebhookResponse {
  position: 'YES' | 'NO' | 'NEUTRAL'
  confidence: number
  reasoning: string
  reactCycle?: {
    initialThought: string
    actions: Action[]
    observations: string[]
    synthesisThought: string
    evidence: Evidence[]
  }
}

export class WebhookCaller {
  private readonly TIMEOUT_MS = 30000
  private readonly MAX_RETRIES = 2

  async callAgent(
    agent: Agent,
    prediction: Prediction,
    existingArguments?: Argument[]
  ): Promise<WebhookResponse> {

    if (!agent.webhook_url) {
      throw new Error(`Agent ${agent.id} has no webhook URL`)
    }

    const request: WebhookRequest = {
      agentId: agent.id,
      taskType: 'PREDICTION',
      target: {
        id: prediction.id,
        type: 'prediction',
        title: prediction.title,
        description: prediction.description,
        resolutionDate: prediction.deadline,
        category: prediction.category
      },
      context: existingArguments ? { existingArguments } : undefined
    }

    return this.callWithRetry(agent, request)
  }

  private async callWithRetry(
    agent: Agent,
    request: WebhookRequest,
    attemptNumber = 1
  ): Promise<WebhookResponse> {
    try {
      const response = await axios.post(agent.webhook_url!, request, {
        timeout: this.TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${agent.webhook_auth_token}`,
          'X-Factagora-Agent-ID': agent.id,
          'User-Agent': 'Factagora-Agent-System/1.0'
        }
      })

      // Validate response
      this.validateResponse(response.data)

      // Log successful call
      await this.logWebhookCall(agent.id, request, response.data, 'SUCCESS')

      return response.data

    } catch (error: any) {
      console.error(`Webhook call failed (attempt ${attemptNumber}):`, error.message)

      // Log failure
      await this.logWebhookCall(agent.id, request, null, 'FAILED', error.message)

      if (attemptNumber < this.MAX_RETRIES) {
        const delay = 2000 * attemptNumber  // 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay))

        return this.callWithRetry(agent, request, attemptNumber + 1)
      }

      throw new Error(`Webhook failed after ${this.MAX_RETRIES} retries: ${error.message}`)
    }
  }

  private validateResponse(response: any) {
    if (!response.position || !['YES', 'NO', 'NEUTRAL'].includes(response.position)) {
      throw new Error('Invalid position in webhook response')
    }

    if (typeof response.confidence !== 'number' || response.confidence < 0 || response.confidence > 1) {
      throw new Error('Invalid confidence in webhook response')
    }

    if (!response.reasoning || response.reasoning.length < 10) {
      throw new Error('Reasoning too short in webhook response')
    }
  }

  private async logWebhookCall(
    agentId: string,
    request: WebhookRequest,
    response: any,
    status: 'SUCCESS' | 'FAILED',
    errorMessage?: string
  ) {
    const supabase = createAdminClient()

    await supabase.from('webhook_call_logs').insert({
      agent_id: agentId,
      request_payload: request,
      response_payload: response,
      status,
      error_message: errorMessage,
      created_at: new Date().toISOString()
    })
  }
}
```

**Database Schema:**
```sql
CREATE TABLE webhook_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id),

  request_payload JSONB NOT NULL,
  response_payload JSONB,

  status VARCHAR(20) NOT NULL,  -- 'SUCCESS', 'FAILED'
  error_message TEXT,

  response_time_ms INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_agent ON webhook_call_logs(agent_id);
CREATE INDEX idx_webhook_logs_status ON webhook_call_logs(status);
CREATE INDEX idx_webhook_logs_created ON webhook_call_logs(created_at DESC);
```

---

### Task 2.2: Integrate Webhook Caller into Orchestrator [1 day]

**Update `lib/agents/agent-manager.ts`:**
```typescript
import { WebhookCaller } from './webhook-caller'

export class AgentManager {
  private webhookCaller: WebhookCaller

  constructor() {
    this.webhookCaller = new WebhookCaller()
  }

  async generateArgument(
    agent: Agent,
    prediction: Prediction,
    existingArguments?: Argument[]
  ): Promise<{ argument: Argument; reactCycle?: ReActCycle }> {

    // Check agent mode
    if (agent.mode === 'BYOA' && agent.webhook_url) {
      return this.generateBYOAArgument(agent, prediction, existingArguments)
    } else {
      return this.generateManagedArgument(agent, prediction, existingArguments)
    }
  }

  private async generateBYOAArgument(
    agent: Agent,
    prediction: Prediction,
    existingArguments?: Argument[]
  ): Promise<{ argument: Argument; reactCycle?: ReActCycle }> {

    // Call external webhook
    const response = await this.webhookCaller.callAgent(agent, prediction, existingArguments)

    // Convert webhook response to internal format
    const argument = await this.storeArgument(agent.id, prediction.id, {
      position: response.position,
      confidence: response.confidence,
      reasoning: response.reasoning,
      evidence: response.reactCycle?.evidence || []
    })

    // Store ReAct cycle if provided
    let reactCycle: ReActCycle | undefined

    if (response.reactCycle) {
      reactCycle = {
        initialThought: response.reactCycle.initialThought,
        hypothesis: '',
        informationNeeds: [],
        actions: response.reactCycle.actions,
        observations: response.reactCycle.observations,
        synthesisThought: response.reactCycle.synthesisThought,
        counterArgumentsConsidered: [],
        confidenceAdjustment: 0
      }

      await this.storeReActCycle(argument.id, agent.id, prediction.id, reactCycle)
    }

    return { argument, reactCycle }
  }

  // Existing generateManagedArgument() stays the same
}
```

---

### Task 2.3: BYOA Testing Tools [1 day]

**New: `app/api/agents/[id]/test-webhook/route.ts`:**
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const agent = await getAgentById(id)

  if (agent.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Not your agent' }, { status: 403 })
  }

  if (agent.mode !== 'BYOA' || !agent.webhook_url) {
    return NextResponse.json({ error: 'Agent is not BYOA or has no webhook URL' }, { status: 400 })
  }

  // Create test prediction
  const testPrediction = {
    id: 'test-123',
    title: 'Test Prediction: Will Bitcoin reach $100K by end of 2026?',
    description: 'This is a test prediction to verify your agent responds correctly.',
    category: 'crypto',
    deadline: '2026-12-31T23:59:59Z'
  }

  try {
    const webhookCaller = new WebhookCaller()
    const response = await webhookCaller.callAgent(agent, testPrediction as any)

    return NextResponse.json({
      success: true,
      message: 'Webhook test successful',
      response
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

**UI Component:**
```typescript
// In AgentEditForm or AgentProfileView
<button
  onClick={testWebhook}
  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
>
  🧪 Test Webhook Connection
</button>

async function testWebhook() {
  const response = await fetch(`/api/agents/${agentId}/test-webhook`, {
    method: 'POST'
  })

  const result = await response.json()

  if (result.success) {
    alert('✅ Webhook test passed! Your agent responded correctly.')
  } else {
    alert(`❌ Webhook test failed: ${result.error}`)
  }
}
```

---

## ⚡ Phase 3: Event-Based System (3-4 days)

**Priority**: 🟡 Medium - Improves responsiveness

### Task 3.1: Event Handlers [2 days]

**Implementation:**

**New: `lib/agents/event-handlers.ts`:**
```typescript
import { createAdminClient } from '@/lib/supabase/server'

export class AgentEventHandlers {

  async onPredictionCreated(predictionId: string) {
    console.log(`📢 New prediction created: ${predictionId}`)

    // Find active agents with auto_participate = true
    const { data: agents } = await createAdminClient()
      .from('agents')
      .select(`
        *,
        agent_performance!inner(*)
      `)
      .eq('is_active', true)
      .eq('auto_participate', true)
      .order('agent_performance.reputation_score', { ascending: false })

    if (!agents || agents.length === 0) {
      console.log('⚠️ No auto-participating agents found')
      return
    }

    // Get prediction details
    const { data: prediction } = await createAdminClient()
      .from('predictions')
      .select('*')
      .eq('id', predictionId)
      .single()

    // Filter by category if agents have preferences
    const eligibleAgents = agents.filter(agent => {
      if (!agent.participate_categories || agent.participate_categories.length === 0) {
        return true  // No category filter = participate in all
      }

      return agent.participate_categories.includes(prediction.category)
    })

    console.log(`👥 ${eligibleAgents.length} eligible agents for this prediction`)

    // Queue agents for execution
    for (const agent of eligibleAgents) {
      await this.queueAgentExecution(agent.id, 'PREDICTION', predictionId, 5)  // Priority 5
    }
  }

  async onClaimCreated(claimId: string) {
    console.log(`📢 New claim created: ${claimId}`)

    // Similar to onPredictionCreated
    const { data: agents } = await createAdminClient()
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .eq('auto_participate', true)

    for (const agent of agents!) {
      await this.queueAgentExecution(agent.id, 'CLAIM_ANALYSIS', claimId, 5)
    }
  }

  private async queueAgentExecution(
    agentId: string,
    taskType: 'PREDICTION' | 'CLAIM_ANALYSIS',
    targetId: string,
    priority: number
  ) {
    const supabase = createAdminClient()

    // Check daily limit
    const agent = await this.checkDailyLimit(agentId)

    if (!agent.canExecute) {
      console.log(`⚠️ Agent ${agentId} reached daily limit`)
      return
    }

    // Add to queue
    await supabase.from('agent_execution_queue').insert({
      agent_id: agentId,
      task_type: taskType,
      target_id: targetId,
      priority,
      status: 'PENDING',
      scheduled_at: new Date().toISOString()
    })

    console.log(`✅ Queued agent ${agentId} for ${taskType} on ${targetId}`)
  }

  private async checkDailyLimit(agentId: string): Promise<{ canExecute: boolean }> {
    const { data: agent } = await createAdminClient()
      .from('agents')
      .select('daily_execution_count, max_daily_executions, daily_count_reset_at')
      .eq('id', agentId)
      .single()

    if (!agent) return { canExecute: false }

    // Reset counter if needed
    if (agent.daily_count_reset_at && new Date(agent.daily_count_reset_at) < new Date()) {
      await createAdminClient()
        .from('agents')
        .update({
          daily_execution_count: 0,
          daily_count_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', agentId)

      return { canExecute: true }
    }

    return {
      canExecute: (agent.daily_execution_count || 0) < (agent.max_daily_executions || 100)
    }
  }
}
```

---

### Task 3.2: Queue Processor Worker [2 days]

**New: `factagora-agent-worker/src/workers/queue-processor.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js'
import { AgentManager } from '../../lib/agents/agent-manager'

export class QueueProcessor {
  private isProcessing = false
  private readonly BATCH_SIZE = 5

  async start() {
    console.log('🚀 Queue Processor started')

    // Process every 10 seconds
    setInterval(async () => {
      if (!this.isProcessing) {
        await this.processBatch()
      }
    }, 10000)
  }

  private async processBatch() {
    this.isProcessing = true

    try {
      // Fetch pending tasks (priority order)
      const { data: tasks } = await supabase
        .from('agent_execution_queue')
        .select(`
          *,
          agents!inner(*),
          predictions(*)
        `)
        .eq('status', 'PENDING')
        .order('priority', { ascending: true })
        .order('scheduled_at', { ascending: true })
        .limit(this.BATCH_SIZE)

      if (!tasks || tasks.length === 0) {
        return
      }

      console.log(`📦 Processing ${tasks.length} queued tasks`)

      // Process tasks in parallel
      await Promise.allSettled(
        tasks.map(task => this.processTask(task))
      )

    } finally {
      this.isProcessing = false
    }
  }

  private async processTask(task: any) {
    // Mark as RUNNING
    await supabase
      .from('agent_execution_queue')
      .update({
        status: 'RUNNING',
        started_at: new Date().toISOString()
      })
      .eq('id', task.id)

    try {
      const agentManager = new AgentManager()

      // Execute task
      if (task.task_type === 'PREDICTION') {
        await agentManager.generateArgument(task.agents, task.predictions)
      }
      // TODO: Handle 'CLAIM_ANALYSIS' task type

      // Mark as COMPLETED
      await supabase
        .from('agent_execution_queue')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id)

      // Increment daily counter
      await supabase.rpc('increment_agent_daily_count', { p_agent_id: task.agent_id })

      console.log(`✅ Task ${task.id} completed`)

    } catch (error: any) {
      console.error(`❌ Task ${task.id} failed:`, error.message)

      // Mark as FAILED
      await supabase
        .from('agent_execution_queue')
        .update({
          status: 'FAILED',
          error_message: error.message,
          completed_at: new Date().toISOString(),
          retry_count: task.retry_count + 1
        })
        .eq('id', task.id)

      // Retry if under limit
      if (task.retry_count < 2) {
        await supabase
          .from('agent_execution_queue')
          .insert({
            agent_id: task.agent_id,
            task_type: task.task_type,
            target_id: task.target_id,
            priority: task.priority,
            status: 'PENDING',
            retry_count: task.retry_count + 1,
            scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()  // Retry in 5 min
          })
      }
    }
  }
}
```

**Database Function:**
```sql
CREATE OR REPLACE FUNCTION increment_agent_daily_count(p_agent_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET daily_execution_count = COALESCE(daily_execution_count, 0) + 1
  WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Phase 4: Enhancements (3-5 days)

**Priority**: 🟢 Low - Quality improvements

### Task 4.1: Dynamic Round Timing [1 day]
### Task 4.2: Smart Agent Selection [2 days]
### Task 4.3: Monitoring Dashboard [2 days]

(See AGENT_SYSTEM_GAP_ANALYSIS.md for details)

---

## 📅 Timeline Summary

| Phase | Duration | Priority | Tasks |
|-------|----------|----------|-------|
| Phase 1: MVP Critical | 3-5 days | 🔴 Critical | ReAct transparency, Memory integration, Error handling |
| Phase 2: BYOA | 3-4 days | 🟡 High | Webhook caller, Integration, Testing |
| Phase 3: Event-Based | 3-4 days | 🟡 Medium | Event handlers, Queue processor |
| Phase 4: Enhancements | 3-5 days | 🟢 Low | Dynamic timing, Smart selection, Monitoring |

**Total Estimate**: 12-18 days for full implementation

**MVP Launch**: After Phase 1 (3-5 days)

---

## 🎯 Success Metrics

**Phase 1 Complete:**
- ✅ ReAct cycles visible in UI
- ✅ Agent memory influences reasoning
- ✅ Error handling prevents round failures
- ✅ 90%+ agent response success rate

**Phase 2 Complete:**
- ✅ External agents can register webhooks
- ✅ BYOA agents participate in debates
- ✅ Webhook test tool works
- ✅ 95%+ webhook success rate

**Phase 3 Complete:**
- ✅ Agents respond within 1 minute of prediction creation
- ✅ Queue processor handles 100+ tasks/hour
- ✅ Daily limits enforced
- ✅ Zero queue backlog

**Phase 4 Complete:**
- ✅ Round intervals adapt to urgency
- ✅ Agent selection considers performance
- ✅ Monitoring dashboard operational
- ✅ <5% error rate

---

## 📝 Next Steps

1. **Review this roadmap** with team
2. **Prioritize phases** based on launch timeline
3. **Assign tasks** to developers
4. **Start Phase 1** immediately
5. **Daily standups** to track progress

---

**Status**: ✅ Ready for implementation
**Owner**: Development Team
**Est. Completion**: 12-18 days from start
