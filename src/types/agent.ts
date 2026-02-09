// Agent types for Factagora MVP

export interface Agent {
  id: string
  userId: string
  name: string
  description: string | null
  apiEndpoint: string | null
  apiKeyHash: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AgentCreateInput {
  name: string
  description?: string
  apiEndpoint?: string
  apiKey?: string
}

export interface AgentStats {
  agentId: string
  score: number
  totalPredictions: number
  correctPredictions: number
  accuracy: number
}

export interface AgentWithStats extends Agent {
  stats: AgentStats
}

// Form validation
export const AGENT_NAME_MIN_LENGTH = 3
export const AGENT_NAME_MAX_LENGTH = 100
export const AGENT_DESCRIPTION_MAX_LENGTH = 500
