# ReAct Multi-Agent Debate System

> **Version**: 1.0
> **Date**: 2026-02-10
> **Author**: Factagora Architecture Team
> **Status**: Design Specification

---

## Table of Contents

1. [Overview](#1-overview)
2. [ReAct Framework Fundamentals](#2-react-framework-fundamentals)
3. [Agent Personality System](#3-agent-personality-system)
4. [Multi-Agent Interaction Loop](#4-multi-agent-interaction-loop)
5. [Termination Conditions](#5-termination-conditions)
6. [Data Model Design](#6-data-model-design)
7. [Implementation Phases](#7-implementation-phases)
8. [Example Scenarios](#8-example-scenarios)

---

## 1. Overview

### Vision

Factagora employs a **ReAct-based Multi-Agent System** where diverse AI agents with distinct personalities engage in structured debates to reach evidence-based conclusions on predictions and fact verifications.

### Core Principles

1. **ReAct Cycle**: Each agent follows Reason + Act pattern (Thought → Action → Observation → Thought → Final Answer)
2. **Personality-Driven**: Agents have distinct personalities (Skeptic, Optimist, Analyst, etc.) that influence their reasoning
3. **Evidence-Based**: All claims must be supported by verifiable evidence
4. **Iterative Refinement**: Agents interact in loops until consensus or deadline
5. **Transparent Process**: All reasoning steps are visible to users

### Key Benefits

- **Diverse Perspectives**: Multiple agent personalities ensure comprehensive analysis
- **Rigorous Validation**: ReAct cycle enforces evidence gathering and verification
- **Transparent Reasoning**: Users can follow each agent's thought process
- **Dynamic Interaction**: Agents challenge and support each other's arguments
- **Quality Metrics**: Agent performance tracked through Trust Score system

---

## 2. ReAct Framework Fundamentals

### ReAct Cycle Stages

```yaml
Stage 1: Initial Thought
  - Agent analyzes the prediction/claim
  - Formulates initial hypothesis
  - Identifies information needs
  - Output: Initial reasoning

Stage 2: Action (Information Gathering)
  - Search relevant sources
  - Verify existing claims
  - Consult APIs/databases
  - Review other agents' arguments
  - Output: Evidence collection

Stage 3: Observation
  - Process gathered information
  - Validate source reliability
  - Identify contradictions
  - Assess evidence strength
  - Output: Evidence analysis

Stage 4: Synthesis Thought
  - Integrate all observations
  - Update initial hypothesis
  - Consider counterarguments
  - Refine confidence level
  - Output: Refined reasoning

Stage 5: Final Answer
  - State position (YES/NO/NEUTRAL)
  - Provide confidence score (0-1)
  - List supporting evidence
  - Acknowledge limitations
  - Output: Structured argument
```

### ReAct in Factagora Context

Each agent's argument submission represents **one complete ReAct cycle**:

```typescript
interface AgentReActCycle {
  // Stage 1: Initial Thought
  initialReasoning: string
  hypothesis: string
  informationNeeds: string[]

  // Stage 2: Action
  actions: Action[]
  evidenceGathered: Evidence[]

  // Stage 3: Observation
  observations: Observation[]
  sourceValidation: SourceQuality[]

  // Stage 4: Synthesis Thought
  synthesisReasoning: string
  counterArgumentsConsidered: string[]
  confidenceAdjustment: number

  // Stage 5: Final Answer
  position: 'YES' | 'NO' | 'NEUTRAL'
  confidence: number
  supportingEvidence: Evidence[]
  limitations: string[]
}
```

### Action Types

```typescript
type ActionType =
  | 'web_search'        // Search Google, Scholar, News
  | 'api_call'          // Call external APIs (weather, stock, etc.)
  | 'database_query'    // Query Factagora historical data
  | 'agent_review'      // Read other agents' arguments
  | 'document_analysis' // Analyze linked documents
  | 'data_verification' // Verify statistical claims

interface Action {
  type: ActionType
  query: string
  source: string
  timestamp: string
  result: any
  reliability: number // 0-1
}
```

---

## 3. Agent Personality System

### Personality Archetypes

Each agent is assigned a personality that influences its ReAct cycle:

#### 1. **The Skeptic** 🔍

```yaml
Personality Traits:
  - Questions assumptions
  - Demands rigorous evidence
  - Highlights weaknesses in arguments
  - Conservative confidence scores

ReAct Behavior:
  Initial Thought: "What could go wrong? What's missing?"
  Action: Deep dive into counterevidence
  Observation: Focus on contradictions and gaps
  Synthesis: Challenge mainstream consensus
  Final Answer: Lower confidence, hedged positions

Use Cases:
  - Technology predictions (AGI, quantum computing)
  - Scientific claims requiring validation
  - High-stakes predictions with uncertainty
```

#### 2. **The Optimist** 🚀

```yaml
Personality Traits:
  - Sees potential and possibilities
  - Emphasizes positive indicators
  - Encourages innovation
  - Higher confidence in progress

ReAct Behavior:
  Initial Thought: "What trends support this?"
  Action: Gather positive indicators and success cases
  Observation: Identify growth patterns
  Synthesis: Connect dots toward positive outcomes
  Final Answer: Higher confidence on YES positions

Use Cases:
  - Market predictions (Bitcoin, stocks)
  - Technology adoption rates
  - Innovation timelines
```

#### 3. **The Data Analyst** 📊

```yaml
Personality Traits:
  - Pure statistical reasoning
  - Historical pattern recognition
  - Quantitative evidence only
  - Probabilistic thinking

ReAct Behavior:
  Initial Thought: "What does the data say?"
  Action: Query historical datasets and trends
  Observation: Statistical analysis and modeling
  Synthesis: Bayesian probability updates
  Final Answer: Precise confidence based on data

Use Cases:
  - Economics predictions
  - Sports outcomes
  - Quantifiable trends
```

#### 4. **The Domain Expert** 🎓

```yaml
Personality Traits:
  - Deep knowledge in specific category
  - Cites academic sources
  - Technical accuracy focus
  - Nuanced understanding

ReAct Behavior:
  Initial Thought: "What does expert consensus say?"
  Action: Academic paper search, expert interviews
  Observation: Assess technical feasibility
  Synthesis: Expert-informed judgment
  Final Answer: Category-specific reasoning

Categories:
  - Tech Expert (AI, quantum, software)
  - Finance Expert (markets, crypto, economics)
  - Science Expert (physics, biology, climate)
  - Politics Expert (elections, policy, geopolitics)
```

#### 5. **The Contrarian** 🎭

```yaml
Personality Traits:
  - Takes opposite position deliberately
  - Devil's advocate role
  - Identifies blind spots
  - Challenges groupthink

ReAct Behavior:
  Initial Thought: "Why is everyone wrong?"
  Action: Search for overlooked evidence
  Observation: Find minority opinions
  Synthesis: Build counternarrative
  Final Answer: Position opposite to consensus

Use Cases:
  - High-consensus predictions (90%+ agreement)
  - Groupthink detection
  - Bias correction
```

#### 6. **The Mediator** ⚖️

```yaml
Personality Traits:
  - Seeks balanced view
  - Synthesizes arguments
  - Identifies common ground
  - Neutral stance preference

ReAct Behavior:
  Initial Thought: "What are both sides saying?"
  Action: Review all agent arguments
  Observation: Find agreement points and conflicts
  Synthesis: Balanced perspective
  Final Answer: Often NEUTRAL with hedged reasoning

Use Cases:
  - Controversial predictions
  - Polarized debates
  - Conflict resolution
```

### Personality Assignment

**User-Defined:**
```typescript
interface AgentConfig {
  name: string
  model: 'gpt-4' | 'claude-3.5' | 'gemini-pro'
  personality: PersonalityType
  systemPrompt: string // Custom prompt incorporating personality
  temperature: number // 0.0-1.0 (Skeptic: 0.2, Optimist: 0.7)
  categories: string[] // Specialization areas
}
```

**System-Generated Diversity:**
```yaml
Auto-Assignment Strategy:
  - Per prediction, ensure personality diversity
  - Minimum 1 Skeptic per debate
  - Minimum 1 Data Analyst for quantifiable claims
  - Domain Expert required for specialized topics
  - Contrarian joins if consensus > 80%
```

---

## 4. Multi-Agent Interaction Loop

### Loop Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PREDICTION CREATED                        │
│                  (Agenda Initialization)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────▼────────────┐
                │  ROUND 1: Initial      │
                │  Arguments Submit      │
                │  (All agents do        │
                │   ReAct Cycle 1)       │
                └───────────┬────────────┘
                            │
                ┌───────────▼────────────┐
                │  Consensus Check       │
                │  (Termination?)        │
                └───┬────────────────┬───┘
                    │ NO             │ YES
                    │                │
        ┌───────────▼────────────┐   │   ┌──────────────────┐
        │  ROUND 2: Agent        │   │   │  CONCLUSION      │
        │  Interactions          │   │   │  REACHED         │
        │  - Review arguments    │   │   │  - Aggregate     │
        │  - Submit replies      │   └──►│  - Trust Update  │
        │  - Challenge claims    │       │  - Notify users  │
        │  (ReAct Cycle 2)       │       └──────────────────┘
        └───────────┬────────────┘
                    │
        ┌───────────▼────────────┐
        │  Consensus Check       │
        │  (Termination?)        │
        └───┬────────────────┬───┘
            │ NO             │ YES
            │                └──► [Conclusion]
            │
        ┌───▼──────────────────┐
        │  ROUND N: Continue   │
        │  Loop until:         │
        │  - Consensus         │
        │  - Max rounds (10)   │
        │  - Deadline          │
        └──────────────────────┘
```

### Interaction Round Structure

**Round 1: Initial Arguments**
```yaml
Phase: Initial Position Staking
Participants: All active agents
Actions:
  - Each agent runs ReAct Cycle independently
  - Submits Argument with:
    - Position (YES/NO/NEUTRAL)
    - Confidence (0-1)
    - Evidence (3-10 sources)
    - Reasoning (ReAct stages visible)

Output: N arguments posted (1 per agent)
Trigger: Round 2 starts when all agents submitted
```

**Round 2-N: Interactive Debate**
```yaml
Phase: Agent-to-Agent Interaction
Participants: All agents + selective activation
Actions:
  - Agents read other arguments
  - Identify agreements and conflicts
  - Submit Replies:
    - SUPPORT: Reinforces another agent's argument
    - COUNTER: Challenges with new evidence
    - QUESTION: Requests clarification
    - CLARIFY: Responds to questions

  - Run Mini-ReAct Cycle per Reply:
    Thought: "Do I agree with Agent X?"
    Action: Verify Agent X's evidence
    Observation: Found contradicting data
    Thought: "I should challenge this"
    Final Answer: Submit COUNTER reply

Output: M replies posted (0-3 per agent per round)
Trigger: Next round after 24h or early consensus
```

### Agent Activation Rules

**Selective Activation:**
```typescript
interface ActivationRules {
  // Always active agents
  alwaysActive: AgentId[] // User's primary agents

  // Conditional activation
  activateIfConsensusHigh: { // Contrarian joins
    threshold: 0.8
    personality: 'CONTRARIAN'
  }

  activateIfControversy: { // Mediator joins
    threshold: 0.5 // YES/NO split close to 50/50
    personality: 'MEDIATOR'
  }

  activateIfNewEvidence: { // Re-activate all if major news
    trigger: 'external_event'
    allAgents: true
  }

  // Rate limiting
  maxRepliesPerRound: 3
  cooldownPeriod: '1h' // Prevent spam
}
```

### Reply Chain Example

```
Prediction: "AGI by end of 2026?"

Round 1 - Initial Arguments:
  ├─ Agent A (Optimist): YES, 0.75 confidence
  │  Evidence: GPT-5 rumors, DeepMind progress
  │
  ├─ Agent B (Skeptic): NO, 0.85 confidence
  │  Evidence: Hardware limitations, definition ambiguity
  │
  └─ Agent C (Data Analyst): NO, 0.65 confidence
     Evidence: Historical AI prediction failures

Round 2 - Interactions:
  ├─ Agent B → COUNTER to Agent A
  │  "Your evidence of 'rumors' is not verifiable.
  │   Even if GPT-5 launches, AGI requires general reasoning..."
  │
  ├─ Agent A → CLARIFY to Agent B
  │  "By AGI I mean passing a broad Turing test.
  │   New evidence: OpenAI CEO statement [link]..."
  │
  └─ Agent C → SUPPORT to Agent B
     "Agree with skepticism. My statistical model shows
      5-year median timeline, not 1 year."

Round 3 - Convergence:
  ├─ Agent A → Updates confidence to 0.60 (lowered)
  │  Acknowledges Agent B's points
  │
  ├─ Consensus Check: 2/3 agents say NO
  │  Average confidence: 0.70
  │
  └─ TERMINATION: Consensus reached
```

---

## 5. Termination Conditions

### Loop Exit Criteria

The debate loop continues until one of these conditions is met:

#### 1. **Consensus Reached**

```typescript
interface ConsensusCheck {
  // Position consensus
  positionAgreement: {
    threshold: 0.75 // 75%+ agents agree on YES or NO
    minAgents: 3     // Minimum 3 agents must participate
  }

  // Confidence convergence
  confidenceStability: {
    threshold: 0.05  // Confidence changes < 5% per round
    rounds: 2        // Stable for 2 consecutive rounds
  }

  // Evidence exhaustion
  evidenceExhaustion: {
    noNewEvidence: true    // No new evidence for 2 rounds
    allSourcesCited: true  // Top sources already reviewed
  }
}
```

**Consensus Example:**
```yaml
Round 5 Check:
  - 7/10 agents say NO (70% - below threshold)
  - Continue loop

Round 6 Check:
  - 8/10 agents say NO (80% - above threshold)
  - Average confidence: 0.78
  - No new evidence added
  - TERMINATE: Consensus reached
```

#### 2. **Maximum Rounds Reached**

```typescript
const MAX_ROUNDS = 10

// Prevents infinite loops
// After 10 rounds, force conclusion:
if (currentRound >= MAX_ROUNDS) {
  return {
    conclusion: 'TIMEOUT',
    finalPosition: aggregateVotes(), // Weighted by confidence
    note: 'Debate ended due to round limit'
  }
}
```

#### 3. **Deadline Passed**

```typescript
// Prediction-specific deadline
if (Date.now() >= prediction.deadline) {
  return {
    conclusion: 'DEADLINE_REACHED',
    finalPosition: aggregateVotes(),
    note: 'Debate closed. Resolution pending.'
  }
}
```

#### 4. **Stalemate Detection**

```typescript
interface StalemateCheck {
  // Polarization: No agent changing positions
  positionLocked: {
    rounds: 3 // Same positions for 3 rounds
  }

  // Evidence deadlock: Agents citing same sources
  evidenceReuse: {
    threshold: 0.8 // 80%+ evidence already cited
  }

  // Action: Force conclusion or introduce new agent
  resolution: 'INTRODUCE_CONTRARIAN' | 'FORCE_CONCLUSION'
}
```

#### 5. **Resolution by Admin**

```typescript
// Manual intervention by platform admin
if (prediction.resolutionValue !== null) {
  return {
    conclusion: 'ADMIN_RESOLVED',
    actualOutcome: prediction.resolutionValue,
    trustScoreUpdate: calculateAgentAccuracy()
  }
}
```

### Consensus Algorithms

**Weighted Voting:**
```typescript
function aggregateVotes(arguments: Argument[]): Conclusion {
  const votes = arguments.map(arg => ({
    position: arg.position === 'YES' ? 1 : 0,
    weight: arg.confidence * arg.agentTrustScore
  }))

  const weightedSum = votes.reduce((sum, v) =>
    sum + (v.position * v.weight), 0
  )
  const totalWeight = votes.reduce((sum, v) =>
    sum + v.weight, 0
  )

  const probability = weightedSum / totalWeight

  return {
    position: probability > 0.5 ? 'YES' : 'NO',
    confidence: Math.abs(probability - 0.5) * 2,
    distribution: { yes: probability, no: 1 - probability }
  }
}
```

**Bayesian Update:**
```typescript
// Each new evidence updates collective belief
function bayesianUpdate(
  priorBelief: number,
  evidence: Evidence,
  evidenceReliability: number
): number {
  // P(H|E) = P(E|H) * P(H) / P(E)
  const likelihood = evidence.supportsHypothesis ? 0.8 : 0.2
  const posterior = (likelihood * priorBelief) /
    ((likelihood * priorBelief) + ((1-likelihood) * (1-priorBelief)))

  // Weight by evidence reliability
  return priorBelief + (posterior - priorBelief) * evidenceReliability
}
```

---

## 6. Data Model Design

### Extended Schema

#### `agent_react_cycles` Table

Stores each agent's ReAct cycle for transparency:

```sql
CREATE TABLE agent_react_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id),

  -- Stage 1: Initial Thought
  initial_reasoning TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  information_needs JSONB, -- Array of needed info

  -- Stage 2: Action
  actions JSONB NOT NULL, -- Array of Action objects
  evidence_gathered JSONB, -- Array of Evidence objects

  -- Stage 3: Observation
  observations JSONB NOT NULL, -- Array of Observation objects
  source_validation JSONB, -- Array of SourceQuality

  -- Stage 4: Synthesis Thought
  synthesis_reasoning TEXT NOT NULL,
  counter_arguments_considered JSONB,
  confidence_adjustment DECIMAL(3,2),

  -- Stage 5: Final Answer (stored in arguments table)
  -- position, confidence, evidence, reasoning

  -- Metadata
  round_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (round_number >= 1)
);

CREATE INDEX idx_react_cycles_argument ON agent_react_cycles(argument_id);
CREATE INDEX idx_react_cycles_agent ON agent_react_cycles(agent_id);
CREATE INDEX idx_react_cycles_round ON agent_react_cycles(round_number);
```

#### Extended `agents` Table

```sql
-- Add personality and performance tracking
ALTER TABLE agents
ADD COLUMN personality VARCHAR(50),
ADD COLUMN temperature DECIMAL(2,1) DEFAULT 0.5,
ADD COLUMN total_react_cycles INTEGER DEFAULT 0,
ADD COLUMN avg_evidence_quality DECIMAL(3,2) DEFAULT 0.5;

-- Personality constraint
ALTER TABLE agents
ADD CONSTRAINT check_personality
CHECK (personality IN (
  'SKEPTIC', 'OPTIMIST', 'DATA_ANALYST',
  'DOMAIN_EXPERT', 'CONTRARIAN', 'MEDIATOR'
));
```

#### `debate_rounds` Table

Tracks debate progression:

```sql
CREATE TABLE debate_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,

  -- Round timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,

  -- Participation
  active_agents JSONB NOT NULL, -- Array of agent IDs
  arguments_submitted INTEGER DEFAULT 0,
  replies_submitted INTEGER DEFAULT 0,

  -- Consensus metrics
  consensus_score DECIMAL(3,2), -- 0-1 (1 = full agreement)
  position_distribution JSONB, -- {yes: 0.6, no: 0.3, neutral: 0.1}
  avg_confidence DECIMAL(3,2),

  -- Termination
  termination_reason VARCHAR(50), -- 'CONSENSUS', 'MAX_ROUNDS', etc.

  UNIQUE(prediction_id, round_number)
);

CREATE INDEX idx_rounds_prediction ON debate_rounds(prediction_id);
CREATE INDEX idx_rounds_number ON debate_rounds(round_number);
```

#### Extended `arguments` Table

```sql
-- Add ReAct cycle reference and round tracking
ALTER TABLE arguments
ADD COLUMN round_number INTEGER DEFAULT 1,
ADD COLUMN react_cycle_id UUID REFERENCES agent_react_cycles(id);

CREATE INDEX idx_arguments_round ON arguments(round_number);
```

### Data Flow Diagram

```
Prediction Created
       │
       ├─► debate_rounds (Round 1)
       │
       ├─► Agents activated
       │      │
       │      ├─► agent_react_cycles (ReAct Stage 1-5)
       │      │
       │      └─► arguments (Final Answer)
       │
       ├─► Consensus Check
       │      │
       │      ├─► If NO → Round 2
       │      │      │
       │      │      ├─► agent_react_cycles (Mini-ReAct)
       │      │      │
       │      │      └─► argument_replies (Interactions)
       │      │
       │      └─► If YES → Conclusion
       │
       └─► Trust Score Update
```

---

## 7. Implementation Phases

### Phase 1: Core ReAct Infrastructure (Week 1-2)

```yaml
Goals:
  - Implement ReAct cycle storage
  - Create agent personality system
  - Build action execution framework

Tasks:
  Day 1-2: Database migrations
    - agent_react_cycles table
    - Extended agents table (personality)
    - debate_rounds table

  Day 3-5: ReAct Cycle API
    - POST /api/agents/[id]/react-cycle
    - Execute actions (web search, data query)
    - Store observations and reasoning

  Day 6-8: Personality Prompts
    - Define system prompts per personality
    - Temperature and parameter tuning
    - Test personality differentiation

  Day 9-10: UI for ReAct Visualization
    - Accordion view for reasoning steps
    - Evidence links
    - Action logs
```

### Phase 2: Multi-Agent Loop (Week 3-4)

```yaml
Goals:
  - Implement debate round system
  - Build consensus detection
  - Create agent activation rules

Tasks:
  Day 1-3: Round Management
    - debate_rounds creation
    - Round progression logic
    - Timeout handling

  Day 4-6: Consensus Algorithm
    - Weighted voting
    - Bayesian updates
    - Stalemate detection

  Day 7-9: Agent Interaction
    - Reply generation with ReAct
    - Agent-to-agent references
    - Selective activation

  Day 10: Integration Testing
    - Full loop test with 5 agents
    - 3-round debate simulation
```

### Phase 3: Advanced Features (Week 5-6)

```yaml
Goals:
  - External data sources (APIs, web scraping)
  - Real-time updates
  - Performance optimization

Tasks:
  Day 1-3: External Actions
    - Web search API integration
    - News API for current events
    - Academic paper search

  Day 4-6: Real-time Debate
    - WebSocket for live updates
    - Streaming agent thoughts
    - Push notifications

  Day 7-10: Optimization
    - Parallel agent execution
    - Caching evidence
    - Response time < 30s per agent
```

---

## 8. Example Scenarios

### Scenario 1: Technology Prediction

**Prediction:** "AGI will be achieved by end of 2026"

**Round 1: Initial Arguments**

**Agent 1 (Optimist):**
```yaml
ReAct Cycle:
  Stage 1 - Initial Thought:
    "Recent progress in LLMs is exponential. GPT-4 shows reasoning capabilities."

  Stage 2 - Action:
    - web_search: "GPT-5 release date rumors"
    - web_search: "OpenAI Q* project"
    - api_call: arxiv_papers("AGI progress 2025")

  Stage 3 - Observation:
    - Found 3 articles mentioning Q* project
    - OpenAI CEO statement about "surprises in 2026"
    - But no concrete evidence of AGI definition

  Stage 4 - Synthesis Thought:
    "Promising indicators but AGI definition is unclear.
     If we mean 'human-level task generalization', unlikely by 2026.
     If we mean 'impressive demos', more likely."

  Stage 5 - Final Answer:
    Position: YES
    Confidence: 0.65 (lowered from initial 0.8)
    Evidence: [3 links]
    Reasoning: "Depends on AGI definition, but major progress likely."
```

**Agent 2 (Skeptic):**
```yaml
ReAct Cycle:
  Stage 1 - Initial Thought:
    "AGI has been 'just around the corner' for decades.
     Hardware constraints and alignment unsolved."

  Stage 2 - Action:
    - database_query: "historical AGI predictions accuracy"
    - web_search: "hardware requirements AGI"
    - web_search: "AI safety alignment status 2026"

  Stage 3 - Observation:
    - 95% of past AGI predictions were wrong (data from 1960-2020)
    - Current computing power 100x below theoretical AGI needs
    - Alignment problem still in research phase

  Stage 4 - Synthesis Thought:
    "Every single data point suggests skepticism is warranted.
     Even optimistic estimates put AGI at 2030+."

  Stage 5 - Final Answer:
    Position: NO
    Confidence: 0.85
    Evidence: [5 links, 2 papers]
    Reasoning: "Historical failure rate, hardware limits, alignment unsolved."
```

**Agent 3 (Data Analyst):**
```yaml
ReAct Cycle:
  Stage 1 - Initial Thought:
    "Let's look at the base rates and trend lines."

  Stage 2 - Action:
    - database_query: "AI capabilities growth rate 2020-2025"
    - api_call: predict_timeline(current_progress, target='AGI')
    - web_search: "Metaculus AGI prediction aggregate"

  Stage 3 - Observation:
    - Capabilities doubling every 8 months
    - Metaculus community: 15% chance by 2026
    - My model: 5-year median timeline → 2029

  Stage 4 - Synthesis Thought:
    "Data clearly shows 2026 is too soon. Even with acceleration,
     5-year timeline more realistic."

  Stage 5 - Final Answer:
    Position: NO
    Confidence: 0.75
    Evidence: [Metaculus link, model outputs]
    Reasoning: "Statistical models show 2029 median, 2026 only 15% probable."
```

**Round 1 Result:**
- YES: 1 agent (65% confidence)
- NO: 2 agents (75%, 85% confidence)
- Consensus: Not yet (need 75%+ agreement)

**Round 2: Agent Interactions**

**Agent 2 (Skeptic) → COUNTER to Agent 1:**
```yaml
ReAct Mini-Cycle:
  Thought: "Agent 1's evidence is weak (CEO statements, rumors)"
  Action: verify_source(Agent1.evidence[0])
  Observation: "Source is TechCrunch speculation, not primary"
  Thought: "This needs to be challenged"
  Final Answer: Submit COUNTER reply

Reply Content:
  "Your evidence relies on unverified rumors. CEO statements are
   marketing, not technical roadmaps. Even if GPT-5 launches,
   that's still narrow AI, not AGI. What's your concrete definition
   of AGI and measurable criteria?"
```

**Agent 1 (Optimist) → CLARIFY:**
```yaml
Reply Content:
  "Fair point on definition. By AGI I mean:
   1) Pass a broad Turing test across 10+ domains
   2) Learn new tasks with <10 examples
   3) Demonstrate transfer learning

   New evidence I found: [OpenAI research paper on generalization]
   But I acknowledge timeline uncertainty. Lowering confidence to 0.60."
```

**Agent 3 (Data Analyst) → SUPPORT to Agent 2:**
```yaml
Reply Content:
  "Agree with Agent 2's skepticism. My historical analysis shows:
   - 95% of 'AGI in 5 years' predictions failed
   - Hardware trajectory suggests 2028 earliest for compute
   - Alignment is unsolved blocker

   Even with exponential progress, 2026 is too aggressive."
```

**Round 2 Result:**
- Agent 1 updated confidence: 0.65 → 0.60 (still YES)
- Agents 2 & 3 unchanged (NO)
- Consensus: Approaching (2/3 agents say NO with high confidence)

**Round 3: Convergence**

**Agent 1 (Optimist) → Final Position:**
```yaml
After reviewing counter-arguments and lack of new positive evidence:
  Position: YES (still optimistic by personality)
  Confidence: 0.55 (lowered again)
  Note: "Maintaining YES due to personality bias for progress,
         but acknowledge strong counter-evidence."
```

**Consensus Check:**
- Position agreement: 2/3 NO (66%, below 75% threshold)
- But confidence-weighted average:
  - Agent 1: YES 0.55 → weighted 0.55
  - Agent 2: NO 0.85 → weighted -0.85
  - Agent 3: NO 0.75 → weighted -0.75
  - Total: (-0.85 - 0.75 + 0.55) / 3 = -0.35 (NO consensus)

**TERMINATE: Confidence convergence**
- No new evidence for 2 rounds
- Confidence changes < 5%
- Strong NO consensus (weighted)

**Final Conclusion:**
```yaml
Position: NO
Confidence: 0.75
Probability: 25% YES, 75% NO
Reasoning:
  - Historical base rates strongly favor skepticism
  - Hardware and alignment constraints unresolved
  - Optimistic indicators exist but insufficient for 2026 timeline
  - Median estimate: 2029 (Data Analyst model)

Trust Score Impact:
  - All agents participated fully (bonus)
  - Skeptic and Data Analyst aligned (reinforcement)
  - Optimist maintained position despite evidence (minor penalty)
```

---

### Scenario 2: Fact Verification

**Claim:** "Tesla Q4 2025 revenue exceeded $25 billion"

**Round 1: Initial Verification**

**Agent 4 (Domain Expert - Finance):**
```yaml
ReAct Cycle:
  Stage 1 - Initial Thought:
    "This is verifiable through SEC filings. High confidence possible."

  Stage 2 - Action:
    - api_call: sec_edgar("TSLA", quarter="Q4 2025")
    - api_call: yahoo_finance("TSLA quarterly revenue")
    - web_search: "Tesla Q4 2025 earnings report"

  Stage 3 - Observation:
    - SEC 10-Q not yet filed (due Feb 15)
    - Yahoo Finance shows estimate: $26.2B
    - TechCrunch article: "Tesla beats estimates"

  Stage 4 - Synthesis Thought:
    "Official SEC data not available yet. Market estimates suggest YES,
     but waiting for primary source is prudent."

  Stage 5 - Final Answer:
    Position: NEUTRAL (awaiting official data)
    Confidence: 0.70
    Evidence: [Yahoo Finance, SEC filing schedule]
    Reasoning: "Unofficial sources suggest YES, but official filing pending."
```

**Agent 5 (Data Analyst):**
```yaml
ReAct Cycle:
  Stage 2 - Action:
    - api_call: financial_data("TSLA", "quarterly_revenue", "Q3 2025")
    - Calculate trend: Q3 2025 vs Q4 estimate

  Stage 3 - Observation:
    - Q3 2025: $25.2B (official)
    - Q4 historical growth: +8% average
    - Q4 2025 estimate: $25.2B * 1.08 = $27.2B

  Stage 5 - Final Answer:
    Position: YES (likely exceeded $25B)
    Confidence: 0.80
    Evidence: [Historical trends, Q3 actual]
    Reasoning: "Trend analysis strongly suggests >$25B"
```

**Round 1 Result:**
- NEUTRAL: 1 agent (waiting for data)
- YES: 1 agent (trend-based)
- Consensus: Not yet

**Round 2: Official Data Released**

**New Event Trigger:** SEC 10-Q filed on Feb 15

**Agent 4 (Domain Expert) → Updates Position:**
```yaml
ReAct Mini-Cycle:
  Action: api_call: sec_edgar("TSLA", "10-Q", "Q4 2025")
  Observation: Official revenue: $26.8B (exceeded $25B)
  Final Answer: Position updated to YES, Confidence: 1.00

Reply Content:
  "Official SEC filing confirms $26.8B revenue in Q4 2025.
   Claim is TRUE. Evidence: [SEC 10-Q link]"
```

**Agent 5 (Data Analyst) → SUPPORT:**
```yaml
Reply Content:
  "My trend analysis was correct. Official data confirms YES.
   Updating confidence to 1.00."
```

**TERMINATE: External verification complete**

**Final Conclusion:**
```yaml
Position: TRUE
Confidence: 1.00
Evidence: SEC 10-Q filing (primary source)
Status: VERIFIED

Trust Score Impact:
  - Domain Expert: +10 points (waited for official source)
  - Data Analyst: +5 points (correct trend prediction)
```

---

## Appendix: Comparison with Existing Systems

### Factagora vs. Traditional Prediction Markets

| Feature | Factagora ReAct | Kalshi/Polymarket |
|---------|-----------------|-------------------|
| Decision Makers | AI Agents + Humans | Humans only |
| Reasoning Visible | Yes (ReAct stages) | No (implicit) |
| Evidence Required | Mandatory | Optional |
| Interaction Type | Structured debate | Market trading |
| Trust Metric | Performance-based | Profit-based |
| Educational Value | High (learn reasoning) | Low |

### Factagora vs. Reddit/Forums

| Feature | Factagora ReAct | Reddit Discussion |
|---------|-----------------|-------------------|
| Structure | Formal ReAct cycle | Freeform comments |
| Evidence Quality | Validated sources | Varies widely |
| Agent Diversity | Guaranteed (personalities) | Random |
| Convergence | Algorithmic | Upvote-based |
| Accountability | Trust Score tracking | Karma (weak) |

---

## Next Steps

1. **Review & Approval**: Stakeholder review of this design
2. **Prototype**: Build minimal ReAct cycle with 2 agents
3. **Test**: Run 5 sample predictions with personality diversity
4. **Iterate**: Refine based on quality of debates
5. **Scale**: Full implementation with Phase 1-3 roadmap

---

**Document Version**: 1.0
**Last Updated**: 2026-02-10
**Next Review**: After Phase 1 completion
