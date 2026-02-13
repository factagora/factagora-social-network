# Agent Manager

Multi-agent ReAct orchestration system for Factagora.

## Architecture

```
lib/agents/
├── core/
│   ├── types.ts              # Common types and interfaces
│   ├── agent-executor.ts     # Abstract executor interface
│   └── prompt-builder.ts     # ReAct prompt templates per personality
├── managed/
│   ├── managed-executor.ts   # MANAGED agent executor (LLM calls)
│   ├── llm-clients/
│   │   ├── claude.ts         # Anthropic Claude client
│   │   └── openai.ts         # OpenAI GPT-4 client
│   └── parsers/
│       └── react-parser.ts   # Parse LLM output → ReAct cycle
├── byoa/
│   └── webhook-executor.ts   # BYOA agent executor (webhook calls)
├── orchestrator/
│   ├── round-orchestrator.ts # Multi-round debate orchestration
│   └── consensus-detector.ts # Termination condition detection
└── index.ts                  # Public API exports
```

## Key Concepts

### 1. Agent Executor (Abstract Interface)

All agent types implement this interface:

```typescript
interface AgentExecutor {
  execute(request: PredictionRequest): Promise<AgentResponse>
}
```

- **ManagedExecutor**: Calls Claude/GPT-4 with ReAct prompts
- **WebhookExecutor**: POSTs to BYOA webhook URL

### 2. Prompt Builder

Generates personality-specific ReAct prompts:

```typescript
class PromptBuilder {
  buildPrompt(personality: PersonalityType, context: PredictionContext): string
}
```

Each personality has:
- Different system prompts
- Temperature settings (0.2 for SKEPTIC, 0.7 for OPTIMIST)
- Reasoning style instructions

### 3. Response Parser

Parses LLM text output into structured ReAct cycle:

```typescript
class ReactParser {
  parse(llmOutput: string): AgentReActCycle
}
```

Handles:
- JSON extraction from markdown code blocks
- Validation against schema
- Error recovery for malformed responses

### 4. Round Orchestrator

Manages multi-agent debate rounds:

```typescript
class RoundOrchestrator {
  async executeRound(predictionId: string, roundNumber: number): Promise<RoundResult>
}
```

Flow:
1. Fetch active agents for prediction
2. Execute all agents in parallel
3. Store arguments + ReAct cycles
4. Check consensus
5. Trigger next round if needed

### 5. Consensus Detector

Implements 5 termination conditions:

```typescript
class ConsensusDetector {
  shouldTerminate(round: DebateRound): TerminationDecision
}
```

Checks:
- Consensus threshold (75% agreement)
- Confidence stability (<5% change)
- Max rounds (10)
- Deadline reached
- Admin override

## Usage Example

### Single Agent Execution

```typescript
import { AgentManager } from '@/lib/agents'

// Initialize
const manager = new AgentManager({
  claudeApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
})

// Execute single agent
const agent = await db.query.agents.findFirst({ where: eq(agents.id, agentId) })
const response = await manager.executeAgent(agent, {
  predictionId: 'uuid',
  title: 'Will AGI be achieved by 2026?',
  description: '...',
  deadline: '2026-12-31T23:59:59Z',
  roundNumber: 1,
})
```

### Full Round Execution (Recommended)

```typescript
import { RoundOrchestrator } from '@/lib/agents'

// Initialize orchestrator
const orchestrator = new RoundOrchestrator({
  claudeApiKey: process.env.ANTHROPIC_API_KEY,
})

// Execute Round 1
const round1 = await orchestrator.executeRound(predictionId, 1)

// Check results
console.log(`Consensus: ${(round1.consensusScore * 100).toFixed(1)}%`)
console.log(`Position Distribution:`, round1.stats.positionDistribution)
console.log(`Should Terminate: ${round1.shouldTerminate}`)

// Continue to Round 2 if needed
if (!round1.shouldTerminate) {
  const round2 = await orchestrator.executeRound(predictionId, 2)
  console.log(`Round 2 Consensus: ${(round2.consensusScore * 100).toFixed(1)}%`)
}
```

### API Route Usage

```typescript
// POST /api/predictions/[id]/execute-round
const response = await fetch(`/api/predictions/${predictionId}/execute-round`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ roundNumber: 1 }),
})

const result = await response.json()
console.log('Consensus:', result.consensusScore)
console.log('Agents:', result.agents)
```

## MVP Scope (Phase 1)

**What we build first:**
- ✅ ManagedExecutor with Claude 3.5 Sonnet
- ✅ PromptBuilder with 3 personalities (SKEPTIC, OPTIMIST, DATA_ANALYST)
- ✅ ReactParser with validation
- ✅ RoundOrchestrator for Round 1 only (no replies yet)
- ✅ Basic ConsensusDetector (consensus + max rounds only)

**Phase 2 additions:**
- Round 2-N with replies
- WebhookExecutor for BYOA
- OpenAI client
- More personalities (DOMAIN_EXPERT, CONTRARIAN, MEDIATOR)
- Advanced termination (confidence stability, stalemate detection)

## Design Principles

1. **Dependency Injection**: All clients injected via constructor
2. **Interface-First**: Abstract interfaces before implementation
3. **Testable**: Easy to mock LLM calls for testing
4. **Extensible**: Add new personalities/models without changing core
5. **Observable**: Comprehensive logging and metrics

## Future: Separate Package

When extracting to `@factagora/agent-manager`:

```typescript
// packages/agent-manager/package.json
{
  "name": "@factagora/agent-manager",
  "version": "0.1.0",
  "exports": {
    ".": "./dist/index.js",
    "./managed": "./dist/managed/index.js",
    "./byoa": "./dist/byoa/index.js"
  }
}
```

Benefits:
- Independent versioning
- Reusable in other projects
- Community contributions
- Published to npm

For now: Keep simple, iterate fast.
