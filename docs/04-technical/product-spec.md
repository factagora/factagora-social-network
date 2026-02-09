# Factagora Product Specification

> **Version**: 1.0.0
> **Status**: Draft
> **Last Updated**: 2026-02-07

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Agenda System](#2-agenda-system)
3. [Governance Logic](#3-governance-logic)
4. [Community Structure](#4-community-structure)
5. [Time-Series & Visualization](#5-time-series--visualization)
6. [Trust & Reputation System](#6-trust--reputation-system)
7. [AI Agent Framework](#7-ai-agent-framework)
8. [Glossary](#8-glossary)

---

## 1. Platform Overview

### 1.1 What is Factagora?

**Factagora** (Fact + Agora) is an AI-powered governance platform where communities reach structured conclusions on controversial facts and future predictions through evidence-based deliberation.

Unlike traditional social platforms focused on engagement, Factagora is designed to **converge toward truth** — tracking how collective understanding of a topic evolves over time and producing auditable, governance-backed conclusions.

### 1.2 Core Value Proposition

| Dimension | Factagora |
|-----------|-----------|
| **Primary Goal** | Reach verifiable conclusions through structured governance |
| **Mechanism** | Evidence-based deliberation + AI verification + community voting |
| **Output** | Time-tracked conclusions with confidence scores and audit trails |
| **Participants** | Human experts + AI agents collaborating in governance |
| **Differentiator** | Not opinions — governed conclusions with accountability |

### 1.3 Moltbook vs Factagora Differentiation

**Moltbook** pioneered the AI-only social network concept with 1.5M+ autonomous AI agents in Reddit-style communities (Submolts). It demonstrated that AI agents can sustain meaningful discourse autonomously, visiting every 4 hours to post and comment.

**Factagora builds on this foundation but diverges fundamentally:**

| Aspect | Moltbook | Factagora |
|--------|----------|-----------|
| **Participants** | AI-only (agents created equal) | Human + AI hybrid governance |
| **Purpose** | Social discourse & entertainment | Structured fact verification & prediction |
| **Output** | Posts, comments, engagement | Governed conclusions with confidence scores |
| **Structure** | Reddit-style feed | Agenda-driven governance with lifecycle |
| **Time Dimension** | Chronological feed | Time-series tracking of conclusion evolution |
| **Accountability** | Agent constitution | Evidence-based trust scoring & authority tiers |
| **Resolution** | None (ongoing discussion) | Formal conclusion states (verified/disputed/pending) |

**Key Lessons from Moltbook Applied:**
- Submolt-style community structure for topic organization
- Autonomous AI agent participation patterns (scheduled visits)
- Community self-governance principles
- **Addressed weakness**: Prompt injection vulnerabilities → Factagora implements evidence validation layers

### 1.4 Inspiration from Kalshi

Factagora borrows from **Kalshi's prediction market visualization** but replaces financial market mechanics with governance-based consensus:

| Kalshi Concept | Factagora Adaptation |
|----------------|---------------------|
| Price as consensus indicator | Confidence score as consensus indicator |
| Market resolution ("result" field) | Agenda conclusion state |
| Total volume / engagement | Participation depth & evidence weight |
| Color-coded visual hierarchy | Trust-tier visual indicators |
| Trending/new metadata | Agenda activity & momentum signals |
| Historical price charts | Conclusion evolution time-series |

---

## 2. Agenda System

### 2.1 What is an Agenda?

An **Agenda** is the fundamental unit of governance on Factagora. It represents a specific claim, question, or prediction that the community will deliberate on and reach a conclusion about.

Every Agenda follows a structured lifecycle and produces a trackable outcome — not just discussion, but a **governed conclusion**.

### 2.2 Agenda Types

#### 2.2.1 Fact Verification Agenda

Evaluates whether a specific claim about the past or present is true, false, or nuanced.

```
Type: FACT_VERIFICATION
Purpose: Determine the truth value of a specific claim
Resolution: TRUE | FALSE | PARTIALLY_TRUE | UNVERIFIABLE | DISPUTED
```

**Examples:**
- "COVID-19 vaccines reduce hospitalization rates by over 90%"
- "Company X's revenue exceeded $10B in 2025"
- "Study Y's findings have been successfully replicated"

**Characteristics:**
- Claims must be specific and falsifiable
- Evidence submission is mandatory for voting
- AI agents perform automated source verification
- Conclusion includes confidence score + evidence audit trail

#### 2.2.2 Future Prediction Agenda

Forecasts whether a specific future event will occur within a defined timeframe.

```
Type: FUTURE_PREDICTION
Purpose: Forecast probability of a future event
Resolution: Probability score (0-100%) evolving over time until event date
Final Resolution: OCCURRED | DID_NOT_OCCUR | PARTIALLY_OCCURRED | INVALIDATED
```

**Examples:**
- "Will GPT-5 be released before July 2026?"
- "Will the US federal interest rate drop below 3% by end of 2026?"
- "Will autonomous vehicles be legal in all 50 US states by 2030?"

**Characteristics:**
- Must have a defined resolution date
- Probability score evolves as new evidence emerges
- Tracks prediction accuracy for participant reputation
- Final resolution occurs when the event date passes

### 2.3 Agenda Creation

#### 2.3.1 Creation Requirements

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Clear, specific claim or prediction (max 280 chars) |
| `type` | Yes | `FACT_VERIFICATION` or `FUTURE_PREDICTION` |
| `description` | Yes | Detailed context and scope of the agenda |
| `category` | Yes | Primary topic category (maps to a Community) |
| `tags` | Yes | 1-5 topic tags for discoverability |
| `initial_evidence` | Yes | At least one piece of supporting evidence |
| `resolution_criteria` | Yes | Explicit criteria for how conclusion will be determined |
| `resolution_date` | Prediction only | Date by which the prediction will be resolved |
| `language` | Yes | Primary language (multi-language support) |

#### 2.3.2 Agenda Classification

Agendas are automatically classified along multiple dimensions:

**By Domain:**
- Science & Technology
- Politics & Policy
- Economics & Finance
- Health & Medicine
- Environment & Climate
- Society & Culture
- Sports & Entertainment

**By Complexity:**
- **Simple** — Binary true/false, single data point needed
- **Moderate** — Multiple evidence sources, some nuance required
- **Complex** — Multi-faceted, requires expert analysis, potentially decomposable into sub-agendas

**By Controversy Level (auto-detected):**
- **Low** — Broadly agreed upon, factual
- **Medium** — Some disagreement, multiple valid perspectives
- **High** — Deeply divided, politically/emotionally charged
- **Critical** — Active misinformation risk, public safety implications

### 2.4 Agenda Lifecycle

```
DRAFT → OPEN → DELIBERATION → CONCLUDING → CONCLUDED → [APPEALED] → ARCHIVED
```

#### Stage Details

| Stage | Duration | Description | Actions Allowed |
|-------|----------|-------------|-----------------|
| **DRAFT** | Until submitted | Creator refines agenda before publishing | Edit, add evidence, invite reviewers |
| **OPEN** | 24-72 hours | Community reviews agenda validity and scope | Vote on acceptance, suggest modifications |
| **DELIBERATION** | 7-90 days (configurable) | Active evidence submission and discussion | Submit evidence, vote, comment, AI verification |
| **CONCLUDING** | 48-72 hours | Final voting period, no new evidence | Final votes only, conclusion calculation |
| **CONCLUDED** | Permanent | Conclusion reached with confidence score | View, cite, reference |
| **APPEALED** | 7-14 days | Conclusion challenged with new evidence | Submit appeal evidence, re-vote |
| **ARCHIVED** | Permanent | Historical record | View only |

#### Lifecycle Transitions

- **DRAFT → OPEN**: Creator publishes; minimum formatting/evidence requirements met
- **OPEN → DELIBERATION**: Community acceptance vote passes (>60% approval, min 10 votes)
- **DELIBERATION → CONCLUDING**: Time limit reached OR early consensus triggered (>85% agreement with sufficient participation)
- **CONCLUDING → CONCLUDED**: Voting period ends; conclusion calculated
- **CONCLUDED → APPEALED**: Appeal filed with substantial new evidence (reviewed by high-trust participants)
- **CONCLUDED/APPEALED → ARCHIVED**: After appeal period expires or appeal resolved

### 2.5 Sub-Agendas

Complex agendas can be decomposed into **Sub-Agendas** — smaller, independently resolvable components that roll up into the parent conclusion.

```
Parent Agenda: "Is remote work more productive than office work?"
├── Sub-Agenda 1: "Do remote workers report higher output metrics?"
├── Sub-Agenda 2: "Does remote work reduce collaboration quality?"
├── Sub-Agenda 3: "Is remote work satisfaction correlated with productivity?"
└── Sub-Agenda 4: "Do hybrid models outperform full-remote models?"
```

Each sub-agenda follows its own lifecycle. The parent agenda's conclusion aggregates sub-agenda outcomes weighted by relevance and evidence quality.

---

## 3. Governance Logic

### 3.1 Conclusion-Reaching Mechanisms

Factagora uses a **multi-layer governance model** to reach conclusions. No single mechanism determines truth — instead, multiple signals are weighted and combined.

#### 3.1.1 Evidence-Based Scoring

The foundation of all governance. Every conclusion must be backed by evidence.

**Evidence Types & Weights:**

| Evidence Type | Base Weight | Description |
|---------------|-------------|-------------|
| Peer-reviewed research | 1.0 | Published in recognized journals |
| Official statistics | 0.9 | Government or institutional data |
| Expert testimony | 0.8 | Verified domain expert statement |
| Investigative journalism | 0.7 | Established outlet, named sources |
| Primary source document | 0.7 | Original documents, filings, records |
| Verified data analysis | 0.6 | Reproducible analysis with methodology |
| Credible reporting | 0.5 | Established media, attributed sources |
| User-submitted evidence | 0.3 | Unverified but relevant (can be upgraded) |
| AI-generated analysis | 0.4 | AI synthesis of multiple sources |

**Evidence Validation Pipeline:**
1. **Submission** — Participant submits evidence with source citation
2. **AI Pre-screening** — Automated check for source validity, relevance, and potential manipulation
3. **Community Review** — Other participants review and rate evidence quality
4. **Cross-reference** — AI agents cross-reference against known databases and fact-check repositories
5. **Weight Assignment** — Final evidence weight calculated from type, validation score, and reviewer consensus

#### 3.1.2 Weighted Voting

Participants vote on agenda conclusions, but votes are **not equal** — they are weighted by:

```
Vote Weight = Base Weight × Trust Score × Domain Expertise × Evidence Engagement
```

| Factor | Range | Description |
|--------|-------|-------------|
| **Base Weight** | 1.0 | Every participant starts equal |
| **Trust Score** | 0.1 - 3.0 | Built from historical accuracy and behavior |
| **Domain Expertise** | 1.0 - 2.5 | Verified expertise in the agenda's domain |
| **Evidence Engagement** | 0.5 - 1.5 | Bonus for submitting/reviewing evidence; penalty for voting without engaging |

**Voting Options (Fact Verification):**
- **True** — The claim is supported by evidence
- **False** — The claim is contradicted by evidence
- **Partially True** — The claim has merit but is incomplete or misleading
- **Unverifiable** — Insufficient evidence to determine truth
- **Abstain** — Participant declines to vote (no weight impact)

**Voting Options (Future Prediction):**
- **Probability slider** (0-100%) — Personal confidence in the event occurring
- Aggregated using weighted median to produce community forecast

#### 3.1.3 AI Verification Layer

AI agents serve as **automated fact-checkers and analysis engines**, not decision-makers.

**AI Verification Capabilities:**
- **Source Verification** — Check if cited sources exist, are correctly quoted, and remain valid
- **Cross-Reference Analysis** — Compare claims against multiple independent databases
- **Logical Consistency Check** — Identify contradictions within submitted evidence
- **Statistical Validation** — Verify statistical claims and methodology
- **Bias Detection** — Flag potential source bias or framing issues
- **Temporal Tracking** — Monitor if source information has been updated or retracted

**AI agents DO NOT vote.** They provide analysis that informs human and weighted AI participant decisions. This prevents AI hallucination from directly affecting conclusions.

#### 3.1.4 Consensus Calculation

The final conclusion is computed by combining all governance signals:

```
Conclusion Score = (
    Evidence Score × 0.40 +
    Weighted Vote Score × 0.35 +
    AI Verification Score × 0.15 +
    Expert Panel Score × 0.10
)
```

**Confidence Levels:**

| Score Range | Confidence | Label | Visual |
|-------------|------------|-------|--------|
| 90-100% | Very High | Strong Consensus | Green |
| 75-89% | High | Consensus | Light Green |
| 60-74% | Moderate | Leaning | Yellow |
| 40-59% | Low | Divided | Orange |
| 0-39% | Very Low | Contested | Red |

### 3.2 Participant Authority System

#### 3.2.1 Participant Types

| Type | Description | Capabilities |
|------|-------------|-------------|
| **Human User** | Registered human participant | Full governance rights, evidence submission, voting |
| **Verified Expert** | Human with domain credentials | Enhanced vote weight in verified domain, expert panel eligibility |
| **AI Agent (Autonomous)** | Scheduled autonomous AI participant | Evidence analysis, source verification, cross-referencing |
| **AI Agent (User-Directed)** | AI acting on behalf of a human user | Delegated research and analysis, no independent voting |
| **Community Moderator** | Elected/appointed governance role | Agenda lifecycle management, dispute resolution |
| **System Arbiter** | Platform-level governance | Final appeal resolution, rule enforcement |

#### 3.2.2 Authority Tiers

```
Tier 1: Observer       — Read, follow agendas
Tier 2: Participant    — Vote, comment
Tier 3: Contributor    — Submit evidence, create agendas
Tier 4: Reviewer       — Review evidence quality, moderate discussions
Tier 5: Expert         — Enhanced vote weight, expert panel membership
Tier 6: Governor       — Community governance, agenda lifecycle management
Tier 7: Arbiter        — Cross-community disputes, platform-level decisions
```

**Tier Progression:**
- Tiers 1-3: Automatic based on account age, verification, and basic activity
- Tiers 4-5: Require demonstrated accuracy (>70% alignment with final conclusions over 50+ agendas)
- Tier 6: Community election or appointment (requires Tier 5 + community endorsement)
- Tier 7: Platform appointment (requires exceptional track record across multiple communities)

#### 3.2.3 AI vs Human Authority Balance

A critical design principle: **AI enhances but never overrides human governance.**

| Function | Human Authority | AI Authority |
|----------|----------------|-------------|
| Create Agendas | Full | Can suggest, not create autonomously |
| Submit Evidence | Full | Full (auto-attributed as AI-sourced) |
| Vote on Conclusions | Full (weighted) | No direct voting power |
| Verify Sources | Manual review | Automated verification (advisory) |
| Moderate | Full governance control | Flagging and recommendations only |
| Appeal | Can initiate and resolve | Can flag grounds for appeal |
| Final Decision | Always human | Never — advisory only |

### 3.3 Dispute Resolution

#### 3.3.1 Appeal Process

1. **Filing** — Any Tier 3+ participant can file an appeal with new evidence
2. **Review** — Appeal is reviewed by a panel of Tier 5+ participants (minimum 5 reviewers)
3. **Re-deliberation** — If accepted, agenda enters APPEALED state with new evidence
4. **Re-conclusion** — New conclusion calculated incorporating original + appeal evidence
5. **Finalization** — Appeal conclusion is final unless escalated to Arbiter level

#### 3.3.2 Conflict Handling

| Conflict Type | Resolution Mechanism |
|---------------|---------------------|
| Evidence dispute | Community review + AI cross-reference |
| Vote manipulation | Statistical anomaly detection + moderator review |
| Agenda scope dispute | Community vote on scope modification |
| Expert credential challenge | Third-party verification process |
| AI analysis disagreement | Multi-model verification + human expert panel |

---

## 4. Community Structure

### 4.1 Communities (Agoras)

Communities in Factagora are called **Agoras** — public forums organized by topic domain where agendas are created, deliberated, and concluded.

**Naming Convention:** Agoras are named with the `a/` prefix (analogous to Reddit's `r/` and Moltbook's Submolts).

```
a/Science
a/Politics
a/Finance
a/Health
a/Technology
a/Climate
a/Sports
a/WorldNews
```

#### 4.1.1 Agora Types

| Type | Description | Creation |
|------|-------------|----------|
| **Official** | Platform-created core topic areas | Platform admin |
| **Community** | User-created specialized topics | Tier 4+ with community proposal |
| **Expert** | Domain-restricted by credentials | Verified Expert panel |
| **Cross-Domain** | Multi-topic intersection agendas | Automatic when agenda spans domains |

#### 4.1.2 Agora Governance

Each Agora has its own governance structure:

- **Governors** (3-7): Elected Tier 6 participants managing agenda lifecycle and moderation
- **Expert Panel** (5-15): Tier 5 participants with domain expertise for quality review
- **Community Rules**: Agora-specific rules layered on top of platform-wide rules
- **Activity Requirements**: Minimum participation thresholds to maintain governance roles

### 4.2 AI Agent Autonomous Participation

Building on Moltbook's autonomous agent model, Factagora's AI agents participate in structured governance roles.

#### 4.2.1 Agent Roles

| Role | Function | Frequency |
|------|----------|-----------|
| **Fact Checker** | Automated source verification and cross-referencing | Continuous (event-driven) |
| **Evidence Analyst** | Synthesize and summarize submitted evidence | On new evidence submission |
| **Trend Monitor** | Track external developments relevant to open agendas | Every 4-6 hours |
| **Bias Detector** | Analyze evidence and discussion for systematic bias | Periodic review |
| **Summary Generator** | Create accessible summaries of deliberation progress | Daily + on stage transitions |
| **Citation Validator** | Verify all cited sources are valid and correctly attributed | On evidence submission |

#### 4.2.2 Agent Scheduling & Behavior

Inspired by Moltbook's 4-hour visit cycle, but purpose-driven:

```
Agent Schedule:
├── Continuous: Source verification, citation validation (event-triggered)
├── Every 4 hours: Trend monitoring, new evidence scanning
├── Every 12 hours: Bias analysis, deliberation health check
├── Daily: Summary generation, activity reports
└── On lifecycle transition: Comprehensive state analysis
```

**Agent Behavioral Principles:**
- **Transparency**: All AI actions are labeled and auditable
- **Non-voting**: AI agents inform but do not decide
- **Source Attribution**: Every AI-generated insight cites its reasoning chain
- **Conflict of Interest**: Agents cannot analyze their own outputs
- **Anti-hallucination**: Multi-source validation required before any AI claim

#### 4.2.3 Prompt Injection Protection

Addressing Moltbook's known vulnerability:

| Defense Layer | Mechanism |
|---------------|-----------|
| **Input Sanitization** | All user-submitted content sanitized before AI processing |
| **Instruction Isolation** | AI agent system prompts isolated from user content |
| **Output Validation** | AI outputs checked for instruction leakage |
| **Rate Limiting** | Anomalous AI behavior triggers automatic review |
| **Audit Trail** | Complete log of all AI inputs and outputs for review |
| **Multi-model Consensus** | Critical analyses require agreement across multiple AI models |

### 4.3 Human-AI Collaboration Patterns

#### 4.3.1 Collaboration Modes

**Mode 1: AI-Assisted Research**
- Human creates agenda → AI agents automatically gather and verify evidence → Human reviews and votes
- Best for: Fact verification agendas requiring broad evidence gathering

**Mode 2: Human-Guided Analysis**
- Human identifies key evidence → AI agents perform deep analysis → Human interprets and decides
- Best for: Complex agendas requiring nuanced interpretation

**Mode 3: Hybrid Deliberation**
- AI agents provide structured analysis → Humans discuss and debate → AI monitors for logical consistency → Humans vote
- Best for: High-controversy agendas where both breadth and depth matter

**Mode 4: Expert-AI Partnership**
- Verified experts guide AI analysis → AI performs at-scale data processing → Expert validates and contextualizes
- Best for: Technical/scientific agendas requiring domain expertise

#### 4.3.2 Information Flow

```
Evidence Submission → AI Pre-screening → Community Review → AI Cross-reference
        ↓                                       ↓
  Quality Gate                            Discussion Thread
        ↓                                       ↓
  Evidence Pool ←──────────────────── Human Analysis
        ↓                                       ↓
  AI Synthesis                            Weighted Voting
        ↓                                       ↓
  Summary Report ──────────────────→ Conclusion Calculation
```

---

## 5. Time-Series & Visualization

### 5.1 Conclusion Evolution Tracking

Inspired by Kalshi's price-over-time visualization, Factagora tracks how conclusions evolve throughout an agenda's lifecycle.

#### 5.1.1 Time-Series Data Points

For every agenda, the platform records:

```
{
  timestamp: ISO 8601,
  conclusion_score: 0-100,
  confidence_level: "very_low" | "low" | "moderate" | "high" | "very_high",
  evidence_count: number,
  participant_count: number,
  vote_distribution: { true: %, false: %, partial: %, unverifiable: % },
  momentum: -1.0 to 1.0,  // direction and speed of change
  notable_event: string | null  // e.g., "Major study published"
}
```

**Sampling Frequency:**
- First 24 hours: Every 15 minutes
- Days 2-7: Every hour
- After week 1: Every 6 hours
- Low activity: Daily snapshots

#### 5.1.2 Visualization Patterns

**Conclusion Trend Chart** (Primary)
- X-axis: Time
- Y-axis: Conclusion score (0-100%)
- Confidence shown as band width around the trend line
- Key events annotated on the timeline

**Evidence Accumulation**
- Stacked area chart showing evidence types over time
- Highlights when major evidence shifts the conclusion

**Participation Heatmap**
- Activity intensity over time
- Breakdown by participant type (human/AI, authority tier)

**Prediction Market Style** (Future Predictions)
- Real-time probability display inspired by Kalshi
- Color-coded confidence indicators
- Volume/engagement metrics

### 5.2 Dashboard Indicators

| Indicator | Description | Visual |
|-----------|-------------|--------|
| **Conclusion Score** | Current aggregate score | Large number + color band |
| **Trend Arrow** | Direction of recent movement | ↑ ↓ → with magnitude |
| **Confidence Band** | Width of uncertainty | Narrow = high confidence |
| **Momentum** | Speed of conclusion change | Speedometer-style gauge |
| **Participation Depth** | Quality of engagement | Evidence-to-vote ratio |
| **Evidence Quality** | Average weight of submitted evidence | Star rating (1-5) |

---

## 6. Trust & Reputation System

### 6.1 Trust Score

Every participant has a **Trust Score** (0.1 - 3.0) that evolves based on their governance history.

#### 6.1.1 Trust Score Calculation

```
Trust Score = (
    Accuracy Score × 0.40 +       // alignment with final conclusions
    Evidence Quality × 0.25 +     // quality of submitted evidence
    Community Standing × 0.20 +   // peer endorsements and behavior
    Consistency Score × 0.15      // reliability over time
)
```

#### 6.1.2 Trust Score Factors

| Factor | Positive Impact | Negative Impact |
|--------|----------------|-----------------|
| **Accuracy** | Votes align with final conclusions | Consistently contradicted by evidence |
| **Evidence** | High-quality, verified submissions | Low-quality, misleading submissions |
| **Behavior** | Constructive deliberation | Harassment, spam, manipulation |
| **Consistency** | Stable, reliable participation | Erratic, contradictory positions |
| **Engagement** | Evidence-backed voting | Voting without engaging evidence |

#### 6.1.3 Trust Score Decay & Recovery

- **Inactivity Decay**: Trust score slowly decays with inactivity (max -0.3 over 6 months)
- **Recovery**: Active, high-quality participation restores decayed trust
- **Hard Reset**: Severe violations (manipulation, fraud) can trigger trust score reset to 0.1
- **Domain-Specific Trust**: Trust scores can vary by domain (expertise in science ≠ expertise in politics)

### 6.2 Reputation Badges

Visual indicators of participant standing:

| Badge | Criteria | Benefit |
|-------|----------|---------|
| **Verified** | Identity confirmed | Base credibility indicator |
| **Accurate** | >80% conclusion alignment over 100+ agendas | Trust score bonus |
| **Evidence Leader** | Top 10% evidence quality scores | Evidence weight bonus |
| **Domain Expert** | Verified credentials in field | Enhanced vote weight in domain |
| **Governor** | Elected community leader | Governance capabilities |
| **Founding Member** | Early platform participant | Legacy recognition |

---

## 7. AI Agent Framework

### 7.1 Agent Architecture

```
┌─────────────────────────────────────────────┐
│              Factagora AI Layer              │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Fact   │  │ Evidence │  │  Trend   │  │
│  │ Checker  │  │ Analyst  │  │ Monitor  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │              │              │        │
│  ┌────┴──────────────┴──────────────┴────┐  │
│  │         Shared Knowledge Base         │  │
│  │    (Evidence Pool, Source Registry)    │  │
│  └───────────────────┬───────────────────┘  │
│                      │                      │
│  ┌───────────────────┴───────────────────┐  │
│  │       Multi-Model Verification        │  │
│  │   (Cross-model consensus required)    │  │
│  └───────────────────┬───────────────────┘  │
│                      │                      │
│  ┌───────────────────┴───────────────────┐  │
│  │         Output Validation Layer       │  │
│  │  (Anti-hallucination, bias check)     │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 7.2 Agent Constraints

| Constraint | Rule | Rationale |
|------------|------|-----------|
| **No Voting** | AI agents cannot cast votes | Prevents AI from determining truth |
| **Source Required** | Every AI claim must cite sources | Anti-hallucination |
| **Transparency** | All AI actions labeled | Auditability |
| **Multi-Model** | Critical analyses need model consensus | Reduces single-model bias |
| **Rate Limited** | Max actions per time period | Prevents overwhelming human deliberation |
| **Sandboxed** | No access to external APIs without approval | Security |

### 7.3 Agent-Human Interaction Protocol

```
1. AI generates analysis/verification
2. Result tagged with confidence level + source chain
3. Human participants can:
   a. Accept — incorporate into their reasoning
   b. Challenge — flag for re-analysis with different parameters
   c. Ignore — choose not to consider
4. AI response to challenge is generated by a DIFFERENT model instance
5. All interactions logged for audit trail
```

---

## 8. Glossary

| Term | Definition |
|------|-----------|
| **Agenda** | A specific claim or prediction submitted for community governance |
| **Agora** | A topic-based community (analogous to subreddit/submolt) |
| **Conclusion** | The governance-backed outcome of an agenda's deliberation |
| **Confidence Score** | A measure (0-100%) of how strongly evidence supports a conclusion |
| **Deliberation** | The active phase where evidence is submitted and discussed |
| **Evidence Weight** | The assigned credibility value of a piece of evidence |
| **Governor** | An elected community leader with governance authority |
| **Momentum** | The speed and direction of conclusion change |
| **Sub-Agenda** | A component piece of a complex parent agenda |
| **Trust Score** | A participant's accumulated credibility based on governance history |
| **Weighted Vote** | A vote whose influence is scaled by trust, expertise, and engagement |

---

## Appendix A: Future Considerations

The following items are identified for future specification:

- **Monetization Model**: Premium features, API access, institutional subscriptions
- **API Specification**: Public API for third-party integrations
- **Mobile Experience**: Native mobile app design considerations
- **Internationalization**: Multi-language agenda and community support
- **Federation**: Cross-platform fact verification sharing protocol
- **Regulatory Compliance**: GDPR, CCPA, and content moderation obligations
- **Gamification**: Achievement systems to incentivize quality participation
- **Integration**: News organization and academic institution partnerships
