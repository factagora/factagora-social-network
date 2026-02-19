// ============================================================================
// Skill Execution Engine
// Handles execution of all skill types with error handling and logging
// ============================================================================

import type {
  Skill,
  SkillExecutionInput,
  SkillExecutionOutput,
} from '@/src/types/skill';
import { logSkillUsage } from '@/lib/db/skills';
import { mockTKGAPICall } from './mock-tkg-api';

// ============================================================================
// Configuration
// ============================================================================

const SKILL_TIMEOUT_MS = 5000; // 5 seconds
const MAX_RETRIES = 1; // Retry once on failure

// ============================================================================
// Circuit Breaker
// Simple circuit breaker to prevent cascading failures
// ============================================================================

class CircuitBreaker {
  private failures: Map<string, number> = new Map();
  private lastFailureTime: Map<string, number> = new Map();
  private readonly threshold = 5; // Open circuit after 5 failures
  private readonly resetTimeout = 60000; // Reset after 1 minute

  isOpen(skillId: string): boolean {
    const failures = this.failures.get(skillId) || 0;
    const lastFailure = this.lastFailureTime.get(skillId) || 0;
    const now = Date.now();

    // Reset if enough time has passed
    if (now - lastFailure > this.resetTimeout) {
      this.failures.set(skillId, 0);
      return false;
    }

    return failures >= this.threshold;
  }

  recordFailure(skillId: string): void {
    const failures = (this.failures.get(skillId) || 0) + 1;
    this.failures.set(skillId, failures);
    this.lastFailureTime.set(skillId, Date.now());
  }

  recordSuccess(skillId: string): void {
    this.failures.set(skillId, 0);
  }
}

const circuitBreaker = new CircuitBreaker();

// ============================================================================
// Main Execution Function
// ============================================================================

/**
 * Execute a skill with timeout, error handling, and logging
 */
export async function executeSkill(
  skill: Skill,
  input: SkillExecutionInput
): Promise<SkillExecutionOutput> {
  const startTime = Date.now();

  // Check circuit breaker
  if (circuitBreaker.isOpen(skill.id)) {
    const error = 'Circuit breaker is open - too many recent failures';
    console.error(`Skill ${skill.slug} circuit breaker open`);

    // Log failure
    await logSkillUsage({
      agentId: input.agentId,
      skillId: skill.id,
      predictionId: input.predictionId,
      inputData: input,
      success: false,
      errorMessage: error,
    });

    return {
      success: false,
      error,
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Execute with timeout
  try {
    const result = await Promise.race([
      executeSkillInternal(skill, input),
      timeoutPromise(SKILL_TIMEOUT_MS),
    ]);

    const executionTimeMs = Date.now() - startTime;

    // Record success
    circuitBreaker.recordSuccess(skill.id);

    // Log success
    await logSkillUsage({
      agentId: input.agentId,
      skillId: skill.id,
      predictionId: input.predictionId,
      inputData: input,
      outputData: result,
      executionTimeMs,
      success: true,
    });

    return {
      success: true,
      data: result,
      executionTimeMs,
    };
  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;

    // Record failure
    circuitBreaker.recordFailure(skill.id);

    const errorMessage = error.message || 'Unknown error';
    console.error(`Skill ${skill.slug} execution failed:`, errorMessage);

    // Log failure
    await logSkillUsage({
      agentId: input.agentId,
      skillId: skill.id,
      predictionId: input.predictionId,
      inputData: input,
      executionTimeMs,
      success: false,
      errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
      executionTimeMs,
    };
  }
}

/**
 * Internal execution logic (no error handling)
 */
async function executeSkillInternal(
  skill: Skill,
  input: SkillExecutionInput
): Promise<any> {
  switch (skill.implementationType) {
    case 'BUILT_IN':
      return await executeBuiltInSkill(skill, input);

    case 'EXTERNAL_API':
      return await executeExternalAPISkill(skill, input);

    case 'WEBHOOK':
      return await executeWebhookSkill(skill, input);

    default:
      throw new Error(`Unknown implementation type: ${skill.implementationType}`);
  }
}

// ============================================================================
// Built-in Skill Execution
// ============================================================================

/**
 * Execute a built-in skill (implemented in TypeScript)
 */
async function executeBuiltInSkill(
  skill: Skill,
  input: SkillExecutionInput
): Promise<any> {
  const config = skill.implementationConfig;
  const handler = config.handler;

  // For now, built-in skills are not implemented
  // In the future, we would dynamically import the handler
  throw new Error(`Built-in skill handler not yet implemented: ${handler}`);
}

// ============================================================================
// External API Skill Execution
// ============================================================================

/**
 * Execute an external API skill (calls external service)
 */
async function executeExternalAPISkill(
  skill: Skill,
  input: SkillExecutionInput
): Promise<any> {
  const config = skill.implementationConfig;
  const apiEndpoint = config.api_endpoint || config.apiEndpoint;
  const authType = config.auth_type || config.authType || 'none';
  const method = config.method || 'POST';

  if (!apiEndpoint) {
    throw new Error('API endpoint not configured for skill');
  }

  // Check if this is a mock API call
  if (apiEndpoint.startsWith('/api/mock/')) {
    return await executeMockAPI(apiEndpoint, input);
  }

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authentication
  if (authType === 'api_key') {
    const apiKeyEnvVar = `${skill.provider?.toUpperCase()}_API_KEY`;
    const apiKey = process.env[apiKeyEnvVar];

    if (!apiKey) {
      throw new Error(`API key not configured: ${apiKeyEnvVar}`);
    }

    headers['X-API-Key'] = apiKey;
  } else if (authType === 'bearer') {
    const tokenEnvVar = `${skill.provider?.toUpperCase()}_TOKEN`;
    const token = process.env[tokenEnvVar];

    if (!token) {
      throw new Error(`Bearer token not configured: ${tokenEnvVar}`);
    }

    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make API call
  const response = await fetch(apiEndpoint, {
    method,
    headers,
    body: method === 'POST' ? JSON.stringify(input) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API call failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const result = await response.json();
  return result;
}

/**
 * Execute mock API call (for testing without real external services)
 */
async function executeMockAPI(endpoint: string, input: any): Promise<any> {
  // Mock TKG API
  if (endpoint.includes('/mock/tkg/')) {
    return await mockTKGAPICall(endpoint, input);
  }

  // Mock Polymarket API
  if (endpoint.includes('/mock/polymarket/')) {
    // Simple mock response
    return {
      currentOdds: { yes: 0.65, no: 0.35 },
      change24h: 0.05,
      volume: 125000,
      trending: true,
    };
  }

  // Mock Sentiment API
  if (endpoint.includes('/mock/sentiment/')) {
    return {
      overallSentiment: 0.35, // Slightly positive
      sentimentDistribution: {
        positive: 0.55,
        neutral: 0.25,
        negative: 0.20,
      },
      keyTopics: ['economy', 'policy', 'future'],
      trendingHashtags: ['#prediction', '#forecast', '#analysis'],
    };
  }

  throw new Error(`Unknown mock API endpoint: ${endpoint}`);
}

// ============================================================================
// Webhook Skill Execution
// ============================================================================

/**
 * Execute a webhook skill (calls user-provided webhook)
 */
async function executeWebhookSkill(
  skill: Skill,
  input: SkillExecutionInput
): Promise<any> {
  const config = skill.implementationConfig;
  const webhookUrl = config.webhook_url || config.webhookUrl;
  const authToken = config.auth_token || config.authToken;

  if (!webhookUrl) {
    throw new Error('Webhook URL not configured for skill');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

// ============================================================================
// Batch Execution
// ============================================================================

/**
 * Execute multiple skills in parallel
 */
export async function executeSkillsBatch(
  skills: Array<{ skill: Skill; input: SkillExecutionInput }>
): Promise<Map<string, SkillExecutionOutput>> {
  const results = new Map<string, SkillExecutionOutput>();

  // Execute all skills in parallel
  const promises = skills.map(async ({ skill, input }) => {
    const result = await executeSkill(skill, input);
    results.set(skill.slug, result);
  });

  await Promise.all(promises);

  return results;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function timeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Skill execution timeout (${ms}ms)`)), ms);
  });
}

/**
 * Validate skill input against required data schema
 */
export function validateSkillInput(skill: Skill, input: any): boolean {
  const requiredData = skill.requiredData;

  if (!requiredData || Object.keys(requiredData).length === 0) {
    return true; // No validation required
  }

  // Check if all required fields are present
  for (const [key, _] of Object.entries(requiredData)) {
    if (!(key in input)) {
      throw new Error(`Missing required input field: ${key}`);
    }
  }

  return true;
}

/**
 * Build enhanced system prompt with skill results
 */
export function buildSystemPromptWithSkills(
  basePrompt: string,
  skillResults: Map<string, SkillExecutionOutput>
): string {
  let enhancedPrompt = basePrompt;

  // Add skill results section
  if (skillResults.size > 0) {
    enhancedPrompt += '\n\n## Available Skill Analysis\n\n';
    enhancedPrompt +=
      'You have access to the following specialized analysis tools. Use these insights to enhance your prediction:\n\n';

    for (const [skillSlug, result] of skillResults.entries()) {
      if (!result.success) {
        continue; // Skip failed skills
      }

      enhancedPrompt += formatSkillResultForPrompt(skillSlug, result.data);
    }
  }

  return enhancedPrompt;
}

/**
 * Format skill result for inclusion in system prompt
 */
function formatSkillResultForPrompt(skillSlug: string, data: any): string {
  let formatted = '';

  switch (skillSlug) {
    case 'timeseries-forecasting':
      formatted += '### 📈 Timeseries Forecasting Analysis\n\n';
      formatted += `**Predicted YES Probability**: ${(data.prediction * 100).toFixed(1)}%\n`;
      formatted += `**Trend**: ${data.trend}\n`;
      formatted += `**Confidence**: ${(data.confidence * 100).toFixed(1)}%\n\n`;
      formatted += '**Supporting Evidence**:\n';
      data.supportingEvidence.forEach((evidence: string, i: number) => {
        formatted += `${i + 1}. ${evidence}\n`;
      });
      formatted += `\n**Technical Details**: ${data.technicalDetails.method} with ${data.technicalDetails.dataPoints} data points`;
      if (data.technicalDetails.r2Score) {
        formatted += ` (R² = ${data.technicalDetails.r2Score.toFixed(3)})`;
      }
      formatted += '\n\n';
      break;

    case 'statistical-validation':
      formatted += '### 🧪 Statistical Validation\n\n';
      formatted += `**Statistically Significant**: ${data.isStatisticallySignificant ? 'Yes' : 'No'}\n`;
      formatted += `**P-Value**: ${data.pValue.toFixed(4)}\n`;
      formatted += `**95% Confidence Interval**: [${data.confidenceInterval.lower.toFixed(3)}, ${data.confidenceInterval.upper.toFixed(3)}]\n\n`;
      formatted += data.analysisSummary + '\n\n';
      break;

    case 'polymarket-integration':
      formatted += '### 📊 Polymarket Market Data\n\n';
      formatted += `**Current Odds**: YES ${(data.currentOdds.yes * 100).toFixed(1)}% / NO ${(data.currentOdds.no * 100).toFixed(1)}%\n`;
      formatted += `**24h Change**: ${data.change24h > 0 ? '+' : ''}${(data.change24h * 100).toFixed(1)}%\n`;
      formatted += `**Trading Volume**: $${data.volume.toLocaleString()}\n`;
      formatted += `**Trending**: ${data.trending ? 'Yes' : 'No'}\n\n`;
      break;

    case 'social-sentiment':
      formatted += '### 💬 Social Media Sentiment\n\n';
      formatted += `**Overall Sentiment**: ${data.overallSentiment > 0 ? 'Positive' : data.overallSentiment < 0 ? 'Negative' : 'Neutral'} (${data.overallSentiment.toFixed(2)})\n`;
      formatted += `**Distribution**: ${(data.sentimentDistribution.positive * 100).toFixed(0)}% positive, ${(data.sentimentDistribution.neutral * 100).toFixed(0)}% neutral, ${(data.sentimentDistribution.negative * 100).toFixed(0)}% negative\n`;
      formatted += `**Key Topics**: ${data.keyTopics.join(', ')}\n`;
      formatted += `**Trending Hashtags**: ${data.trendingHashtags.join(', ')}\n\n`;
      break;

    default:
      formatted += `### ${skillSlug}\n\n`;
      formatted += JSON.stringify(data, null, 2) + '\n\n';
  }

  return formatted;
}
