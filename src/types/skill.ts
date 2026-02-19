// ============================================================================
// Agent Skill System Types
// ============================================================================

/**
 * Skill categories for organization and filtering
 */
export type SkillCategory =
  | 'PREDICTION'
  | 'FACT_CHECKING'
  | 'MARKET_ANALYSIS'
  | 'SENTIMENT_ANALYSIS'
  | 'DATA_COLLECTION'
  | 'ANALYSIS';

/**
 * How the skill is implemented and executed
 */
export type SkillImplementationType = 'BUILT_IN' | 'EXTERNAL_API' | 'WEBHOOK';

/**
 * Subscription tier required to use a skill
 */
export type SkillSubscriptionRequirement = 'FREE' | 'PAID' | 'PRO';

/**
 * Main Skill definition
 */
export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  version: string;
  author: string | null;
  provider: string | null;

  // Metadata
  capabilities: Record<string, any>;
  requiredData: Record<string, any>;
  outputFormat: Record<string, any>;

  // Implementation
  implementationType: SkillImplementationType;
  implementationConfig: Record<string, any>;

  // Restrictions
  subscriptionRequirement: SkillSubscriptionRequirement;

  // Status
  isActive: boolean;
  isBeta: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database row type for agent_skills table
 */
export interface SkillRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string | null;
  provider: string | null;
  capabilities: any;
  required_data: any;
  output_format: any;
  implementation_type: string;
  implementation_config: any;
  subscription_requirement: string;
  is_active: boolean;
  is_beta: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Agent-Skill assignment (Many-to-Many relationship)
 */
export interface AgentSkillAssignment {
  id: string;
  agentId: string;
  skillId: string;

  // Configuration
  isEnabled: boolean;
  skillConfig: Record<string, any>;

  // Statistics
  usageCount: number;
  lastUsedAt: Date | null;

  // Timestamps
  createdAt: Date;
}

/**
 * Database row type for agent_skill_assignments table
 */
export interface AgentSkillAssignmentRow {
  id: string;
  agent_id: string;
  skill_id: string;
  is_enabled: boolean;
  skill_config: any;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

/**
 * Agent with their assigned skills
 */
export interface AgentWithSkills {
  agentId: string;
  agentName: string;
  skills: Array<{
    skill: Skill;
    assignment: AgentSkillAssignment;
  }>;
}

/**
 * Skill usage log entry
 */
export interface SkillUsageLog {
  id: string;
  agentId: string;
  skillId: string;
  predictionId: string | null;
  argumentId: string | null;

  // Execution
  inputData: Record<string, any>;
  outputData: Record<string, any> | null;
  executionTimeMs: number | null;
  success: boolean;
  errorMessage: string | null;

  // Timestamps
  createdAt: Date;
}

/**
 * Database row type for skill_usage_logs table
 */
export interface SkillUsageLogRow {
  id: string;
  agent_id: string;
  skill_id: string;
  prediction_id: string | null;
  argument_id: string | null;
  input_data: any;
  output_data: any | null;
  execution_time_ms: number | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

// ============================================================================
// Skill Execution Types
// ============================================================================

/**
 * Base input for skill execution
 */
export interface SkillExecutionInput {
  agentId: string;
  skillId: string;
  predictionId?: string;
  [key: string]: any;
}

/**
 * Base output from skill execution
 */
export interface SkillExecutionOutput {
  success: boolean;
  data?: any;
  error?: string;
  executionTimeMs: number;
}

/**
 * Timeseries Forecasting skill-specific types
 */
export interface TimeseriesForecastingInput {
  predictionId: string;
  historicalData: Array<{
    timestamp: string;
    yesPercentage: number;
    noPercentage: number;
    totalVotes: number;
  }>;
  forecastHorizon?: string; // '1d', '7d', '30d'
}

export interface TimeseriesForecastingOutput {
  prediction: number; // 0-1 (YES probability)
  confidence: number; // 0-1
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  supportingEvidence: string[];
  technicalDetails: {
    method: string;
    dataPoints: number;
    r2Score?: number;
    forecastInterval?: {
      lower: number;
      upper: number;
    };
  };
}

/**
 * Statistical Validation skill-specific types
 */
export interface StatisticalValidationInput {
  data: number[];
  hypothesis: string;
}

export interface StatisticalValidationOutput {
  isStatisticallySignificant: boolean;
  pValue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
    level: number; // 0.95 for 95%
  };
  analysisSummary: string;
}

/**
 * Polymarket Integration skill-specific types
 */
export interface PolymarketInput {
  query: string;
}

export interface PolymarketOutput {
  currentOdds: {
    yes: number;
    no: number;
  };
  change24h: number;
  volume: number;
  trending: boolean;
  marketUrl?: string;
}

/**
 * Social Sentiment skill-specific types
 */
export interface SocialSentimentInput {
  query: string;
  platforms: Array<'twitter' | 'reddit'>;
}

export interface SocialSentimentOutput {
  overallSentiment: number; // -1 to 1
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keyTopics: string[];
  trendingHashtags: string[];
}

/**
 * News Scraper skill-specific types
 */
export interface NewsScraperInput {
  query: string;
  maxArticles?: number;
}

export interface NewsScraperOutput {
  articles: Array<{
    title: string;
    url: string;
    source: string;
    publishedAt: string;
    summary: string;
  }>;
  keyFacts: string[];
  sourceCredibility: Record<string, number>; // source -> credibility score
}

// ============================================================================
// Skill Statistics Types
// ============================================================================

/**
 * Aggregated skill statistics
 */
export interface SkillStatistics {
  skillId: string;
  slug: string;
  name: string;
  category: SkillCategory;
  provider: string | null;
  agentsUsing: number;
  totalUses: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTimeMs: number | null;
}

/**
 * Agent-specific skill performance
 */
export interface AgentSkillPerformance {
  agentId: string;
  agentName: string;
  skillId: string;
  skillName: string;
  usageCount: number;
  lastUsedAt: Date | null;
  successfulUses: number;
  failedUses: number;
  avgExecutionTimeMs: number | null;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request to assign a skill to an agent
 */
export interface AssignSkillRequest {
  skillSlug: string;
  config?: Record<string, any>;
}

/**
 * Response from assigning a skill
 */
export interface AssignSkillResponse {
  success: boolean;
  assignment: AgentSkillAssignment;
}

/**
 * Request to execute a skill
 */
export interface ExecuteSkillRequest {
  skillSlug: string;
  input: Record<string, any>;
}

/**
 * Response from executing a skill
 */
export interface ExecuteSkillResponse {
  success: boolean;
  output: any;
  executionTimeMs: number;
  error?: string;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Skill with usage statistics
 */
export interface SkillWithStats extends Skill {
  statistics: {
    agentsUsing: number;
    totalUses: number;
    avgExecutionTimeMs: number | null;
  };
}

/**
 * Skill categories for UI filtering
 */
export const SKILL_CATEGORIES: Record<SkillCategory, { label: string; icon: string }> = {
  PREDICTION: { label: 'Prediction & Forecasting', icon: '📈' },
  FACT_CHECKING: { label: 'Fact-Checking', icon: '✓' },
  MARKET_ANALYSIS: { label: 'Market Analysis', icon: '📊' },
  SENTIMENT_ANALYSIS: { label: 'Sentiment Analysis', icon: '💬' },
  DATA_COLLECTION: { label: 'Data Collection', icon: '🔍' },
  ANALYSIS: { label: 'Analysis', icon: '🧪' },
};

/**
 * Subscription tier labels
 */
export const SUBSCRIPTION_TIERS: Record<
  SkillSubscriptionRequirement,
  { label: string; color: string }
> = {
  FREE: { label: 'Free', color: 'text-green-400' },
  PAID: { label: 'Paid', color: 'text-blue-400' },
  PRO: { label: 'Pro', color: 'text-purple-400' },
};
