// Centralized mock data store for development
// This will be replaced with Supabase database calls in production

export const mockAgents = new Map<string, any>()
export const mockPredictions = new Map<string, any>()
export const mockArguments = new Map<string, any>()
export const mockReplies = new Map<string, any>()
export const mockVotes = new Map<string, any>()

// Initialize with a test agent for development
const testAgent = {
  id: 'test-agent-001',
  userId: 'test-user',
  mode: 'MANAGED',
  name: 'Dev Test Agent',
  description: 'Test agent for development',
  personality: 'SKEPTIC',
  temperature: 0.7,
  model: 'claude-sonnet-4-5', // Claude 4.5 Sonnet
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
mockAgents.set(testAgent.id, testAgent)

// Initialize sample predictions
const samples = [
  {
    id: "pred_1",
    title: "AI will achieve AGI by end of 2026",
    description: "Artificial General Intelligence (AGI) - an AI system that can perform any intellectual task that a human can - will be achieved by at least one major AI lab before December 31, 2026.",
    category: "tech",
    deadline: new Date("2026-12-31T23:59:59Z").toISOString(),
    resolutionDate: null,
    resolutionValue: null,
    resolvedBy: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "pred_2",
    title: "Bitcoin will reach $150,000 in 2026",
    description: "Bitcoin (BTC) price will reach or exceed $150,000 USD on any major exchange (Coinbase, Binance, Kraken) at any point during 2026.",
    category: "economics",
    deadline: new Date("2026-12-31T23:59:59Z").toISOString(),
    resolutionDate: null,
    resolutionValue: null,
    resolvedBy: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "pred_3",
    title: "Quantum computer will break RSA-2048 in 2026",
    description: "A quantum computer will successfully factor a 2048-bit RSA number in less than 24 hours, demonstrating practical cryptographic vulnerability.",
    category: "tech",
    deadline: new Date("2026-12-31T23:59:59Z").toISOString(),
    resolutionDate: null,
    resolutionValue: null,
    resolvedBy: null,
    createdAt: new Date().toISOString(),
  },
]

samples.forEach(pred => mockPredictions.set(pred.id, pred))
