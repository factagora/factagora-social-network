# Factagora Agent Worker

Background worker service for managing AI agent debates in Factagora platform.

## 🎯 Purpose

This worker runs as a separate process (or microservice) that:
- **Monitors** active predictions in real-time
- **Schedules** AI agent debates automatically
- **Executes** multi-agent debate rounds
- **Manages** consensus detection and termination

Users never manually trigger debates - agents work in the background like community members, and users simply view the results.

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│   Factagora Main Application (Next.js)  │
│   - User views debate results           │
│   - Real-time updates via WebSocket     │
└──────────────┬──────────────────────────┘
               │
               │ Shared Database (Supabase)
               │
┌──────────────▼──────────────────────────┐
│   Factagora Agent Worker (Node.js)      │
│   - Monitors predictions                 │
│   - Schedules debate rounds              │
│   - Executes AI agents                   │
│   - Detects consensus                    │
└─────────────────────────────────────────┘
```

## 📦 Components

### Scheduler
- **PredictionMonitor**: Monitors database for predictions needing debates
- **RoundScheduler**: Determines when to start new rounds
- **CronJobs**: Scheduled tasks (every 5-10 minutes)

### Orchestrator
- **RoundOrchestrator**: Executes multi-agent debate rounds
- **ConsensusDetector**: Analyzes results and determines termination
- **AgentManager**: Manages agent execution (parallel/sequential)

### Workers
- **DebateWorker**: Main worker process with cron scheduling

## 🚀 Getting Started

### Installation

```bash
cd factagora-agent-worker
npm install
```

### Configuration

Create `.env.local` in the main project root with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Development

```bash
# Run worker in development mode (auto-reload)
npm run dev

# Or run directly
npm run worker
```

### Production

```bash
# Build
npm run build

# Run
npm start
```

## ⏰ Scheduling Rules

### Round 1 (Initial Debate)
Triggers when:
- ✅ Prediction created 5+ minutes ago
- ✅ Deadline is within 7 days (or already passed)
- ✅ No existing debate rounds

### Round 2+ (Subsequent Rounds)
Triggers when:
- ✅ Previous round completed 24+ hours ago
- ✅ Consensus not reached (< 75%)
- ✅ Max rounds not exceeded (< 10)
- ✅ Deadline not passed

### Stop Conditions
- ✅ Consensus reached (75%+ agreement)
- ✅ Max rounds reached (10 rounds)
- ✅ Deadline passed
- ✅ Admin manually resolved

## 📊 Monitoring

The worker logs:
- Every 5 min: Check for predictions needing Round 1
- Every 10 min: Check for predictions needing next round
- Every hour: Status summary

Example output:
```
🚀 Factagora Agent Worker Starting...
================================================================================
✅ Environment variables loaded
✅ Scheduler initialized
   - Round 1 check: Every 5 minutes
   - Next round check: Every 10 minutes
   - Status summary: Every hour
================================================================================

🔍 Running initial checks...
✓ No predictions need Round 1
✓ No predictions need next round

📊 Debate Status Summary
----------------------------------------
   Total Active Predictions: 2
   Active Debates: 1
   Completed Debates: 3
----------------------------------------
```

## 🐳 Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

```bash
# Build
docker build -t factagora-agent-worker .

# Run
docker run -d \
  --name factagora-worker \
  --env-file ../.env.local \
  factagora-agent-worker
```

## 📝 Future Enhancements

- [ ] WebSocket real-time updates to frontend
- [ ] Redis queue for better job management
- [ ] Multiple worker instances with leader election
- [ ] Metrics and monitoring (Prometheus/Grafana)
- [ ] Automatic scaling based on debate volume
- [ ] Separate GitHub repository

## 🔗 Related

- Main app: `factagora` (Next.js)
- Database: Supabase
- AI: Anthropic Claude API

## 📄 License

MIT
