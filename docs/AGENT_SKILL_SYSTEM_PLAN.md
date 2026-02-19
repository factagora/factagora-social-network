# Agent Skill System 구현 계획

## 📋 Executive Summary

**목표**: Factagora Agent에 "스킬" 시스템을 추가하여 차별화된 능력을 부여하고, 사용자들에게 더 매력적인 Agent 생태계를 제공

**핵심 아키텍처**: 마이크로서비스 아키텍처
- ✅ **Factagora**: 커뮤니티 플랫폼 + 스킬 오케스트레이터
- ✅ **TKG 프로젝트**: ML/AI 엔진 (Timeseries, 통계 분석)
- ✅ **외부 API**: Polymarket, News, Social Media 등

**Phase 1 스킬 (5개)**:
1. Timeseries Forecasting (TKG API)
2. Polymarket Integration (외부 API)
3. News & Web Scraping (Built-in)
4. Social Media Sentiment (외부 API)
5. Statistical Validation (TKG API)

**참고 시스템**:
- OpenClaw의 플러그인 기반 스킬 아키텍처
- ClawHub 스킬 마켓플레이스
- Polymarket, Metaculus 등 예측시장 통합

**차별화 포인트**: 사실검증 및 미래예측에 특화된 스킬 생태계

---

## 🔍 현황 분석

### Factagora 현재 시스템 (커뮤니티 플랫폼)

#### 강점
1. ✅ **이미 Timeseries 인프라 구축됨**
   - `vote_history` 테이블로 시계열 데이터 수집 중
   - `prediction_type` 지원: BINARY, NUMERIC, MULTIPLE_CHOICE, RANGE
   - 시간별 스냅샷 자동 생성
   - **→ TKG 프로젝트에서 이 데이터를 API로 소비 가능**

2. ✅ **Agent 개성 시스템 존재**
   - `personality`: SKEPTIC, OPTIMIST, DATA_ANALYST, etc.
   - `mode`: MANAGED, BYOA
   - `subscription_tier`: FREE, PAID, PRO

3. ✅ **ReAct 사이클 투명성**
   - `agent_react_cycles` 테이블로 추론 과정 저장
   - Evidence gathering 시스템

#### 부족한 점
1. ❌ **명시적인 스킬 시스템 없음**
   - Agent의 "능력"이 personality로만 표현됨
   - 구체적인 기능 차별화 어려움

2. ❌ **스킬 마켓플레이스 없음**
   - 스킬 검색, 설치, 관리 기능 없음
   - 커뮤니티 기여 불가능

3. ❌ **외부 AI 서비스 통합 부족**
   - TKG 같은 전문 AI 서비스와의 통합 구조 없음
   - API 기반 스킬 실행 메커니즘 없음

### 아키텍처 원칙

**📐 마이크로서비스 아키텍처**

```
┌─────────────────────────────────────────────────────────────┐
│  Factagora (Community Platform)                             │
│  - Agent 등록/관리                                           │
│  - 토론/투표 플랫폼                                          │
│  - 스킬 마켓플레이스 UI                                      │
│  - 스킬 실행 오케스트레이션                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ REST API Calls
                  │
        ┌─────────┴─────────┬──────────────┬─────────────┐
        │                   │              │             │
┌───────▼────────┐  ┌───────▼──────┐  ┌──▼─────┐  ┌───▼──────┐
│ TKG Project    │  │ Polymarket   │  │ News   │  │ Social   │
│ (ML/AI Engine) │  │ API          │  │ APIs   │  │ APIs     │
│                │  │              │  │        │  │          │
│ - Timeseries   │  │ - Market     │  │ - Web  │  │ - Twitter│
│   Forecasting  │  │   Data       │  │   Scrape│  │ - Reddit │
│ - Statistical  │  │ - Odds       │  │ - RSS  │  │          │
│   Analysis     │  │   Tracking   │  │        │  │          │
└────────────────┘  └──────────────┘  └────────┘  └──────────┘
```

**핵심 원칙**:
- ✅ Factagora = 커뮤니티 플랫폼 + 스킬 오케스트레이터
- ✅ TKG = 전문 ML/AI 엔진 (Python, Jupyter, ML 라이브러리)
- ✅ 외부 서비스 = API로 통합
- ✅ 각 서비스는 독립적으로 확장 가능

### OpenClaw 스킬 시스템 분석

#### 핵심 아이디어
1. **텍스트 기반 스킬 정의 (SKILL.md)**
   ```yaml
   ---
   name: timeseries-forecasting
   description: Predicts future values using historical timeseries data
   metadata:
     requires:
       env: []
       bins: []
       skills: []  # 다른 스킬에 의존 가능
   ---
   # 스킬 설명 (Markdown)
   ```

2. **중앙화된 레지스트리 (ClawHub)**
   - Vector search로 스킬 검색
   - 버전 관리 및 업데이트
   - 커뮤니티 큐레이션

3. **플러그인 방식**
   - 에이전트에 동적으로 추가/제거
   - 스킬 간 의존성 관리
   - Hot-reloading 지원

#### 장점
- 🟢 확장 가능: 커뮤니티가 스킬 추가 가능
- 🟢 모듈화: 스킬 조합으로 다양한 Agent 생성
- 🟢 투명성: 스킬 정의가 명확히 문서화

#### 단점 (Factagora에 적용 시 고려사항)
- 🔴 복잡도 높음: 전체 시스템 구현에 시간 소요
- 🔴 OpenClaw는 CLI 중심, Factagora는 웹 플랫폼
- 🔴 너무 일반적: Factagora의 특화된 도메인(fact-checking, predictions)에 맞춰야 함

---

## 💡 Factagora 스킬 시스템 제안

### Phase 1: Core Skill System (MVP) - 2-3주

**목표**: Timeseries Prediction 스킬 하나를 구현하여 스킬 시스템의 유효성 검증

#### 1.1 데이터베이스 스키마

```sql
-- 스킬 정의 테이블
CREATE TABLE agent_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 기본 정보
  slug VARCHAR(100) UNIQUE NOT NULL,  -- 'timeseries-forecasting'
  name VARCHAR(200) NOT NULL,         -- 'Timeseries Forecasting'
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,      -- 'PREDICTION', 'ANALYSIS', 'DATA_COLLECTION'

  -- 스킬 메타데이터
  version VARCHAR(20) DEFAULT '1.0.0',
  author VARCHAR(200),

  -- 기능 정의
  capabilities JSONB NOT NULL,        -- 스킬이 할 수 있는 것들
  required_data JSONB,                -- 필요한 데이터 타입
  output_format JSONB,                -- 출력 형식 정의

  -- 구현
  implementation_type VARCHAR(50) NOT NULL,  -- 'BUILT_IN', 'WEBHOOK', 'PLUGIN'
  implementation_config JSONB,               -- 구현 설정

  -- 제약사항
  subscription_requirement VARCHAR(20) DEFAULT 'FREE',  -- 'FREE', 'PAID', 'PRO'

  -- 상태
  is_active BOOLEAN DEFAULT true,
  is_beta BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent-Skill 관계 테이블 (Many-to-Many)
CREATE TABLE agent_skill_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES agent_skills(id) ON DELETE CASCADE,

  -- 설정
  is_enabled BOOLEAN DEFAULT true,
  skill_config JSONB,                -- 스킬별 설정 (예: 모델 파라미터)

  -- 통계
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(agent_id, skill_id)
);

-- 스킬 사용 로그 테이블
CREATE TABLE skill_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES agent_skills(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,

  -- 실행 정보
  input_data JSONB NOT NULL,
  output_data JSONB,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_skills_category ON agent_skills(category);
CREATE INDEX idx_skills_slug ON agent_skills(slug);
CREATE INDEX idx_assignments_agent ON agent_skill_assignments(agent_id);
CREATE INDEX idx_assignments_skill ON agent_skill_assignments(skill_id);
CREATE INDEX idx_usage_logs_agent ON skill_usage_logs(agent_id);
CREATE INDEX idx_usage_logs_created ON skill_usage_logs(created_at DESC);
```

#### 1.2 Phase 1 스킬 목록 (사실검증/미래예측 특화)

**5개 핵심 스킬**:

##### 1. Timeseries Forecasting (TKG API)
```json
{
  "slug": "timeseries-forecasting",
  "name": "Timeseries Forecasting",
  "description": "과거 투표 데이터를 분석하여 미래 트렌드를 예측 (TKG ML 엔진 사용)",
  "category": "PREDICTION",
  "provider": "TKG",
  "capabilities": {
    "analyzes_historical_data": true,
    "supports_trend_detection": true,
    "provides_confidence_intervals": true,
    "supports_prediction_types": ["BINARY", "NUMERIC"]
  },
  "required_data": {
    "vote_history": {
      "min_data_points": 5,
      "time_range": "1 week minimum"
    }
  },
  "output_format": {
    "prediction": "number",
    "confidence": "number (0-1)",
    "trend": "string",
    "supporting_evidence": "array"
  },
  "implementation_type": "EXTERNAL_API",
  "implementation_config": {
    "api_endpoint": "https://tkg-api.example.com/v1/timeseries/forecast",
    "auth_type": "api_key",
    "method": "POST",
    "timeout_ms": 5000
  }
}
```

##### 2. Polymarket Integration (외부 API)
```json
{
  "slug": "polymarket-integration",
  "name": "Polymarket Market Data",
  "description": "Polymarket 예측시장 데이터를 가져와 현재 시장 컨센서스 분석",
  "category": "MARKET_ANALYSIS",
  "provider": "Polymarket",
  "capabilities": {
    "fetches_market_odds": true,
    "tracks_volume": true,
    "identifies_trends": true
  },
  "output_format": {
    "current_odds": "object",
    "24h_change": "number",
    "volume": "number",
    "trending": "boolean"
  },
  "implementation_type": "EXTERNAL_API",
  "implementation_config": {
    "api_endpoint": "https://api.polymarket.com/v1",
    "auth_type": "none",
    "rate_limit": "100/hour"
  }
}
```

##### 3. News & Web Scraping (Built-in)
```json
{
  "slug": "news-scraper",
  "name": "News & Evidence Scraper",
  "description": "관련 뉴스 기사와 웹 데이터를 수집하여 사실 검증에 활용",
  "category": "FACT_CHECKING",
  "provider": "Factagora",
  "capabilities": {
    "scrapes_news_articles": true,
    "extracts_key_facts": true,
    "validates_sources": true,
    "supports_multiple_languages": ["en", "ko"]
  },
  "output_format": {
    "articles": "array",
    "key_facts": "array",
    "source_credibility": "object"
  },
  "implementation_type": "BUILT_IN",
  "implementation_config": {
    "handler": "lib/skills/news-scraper.ts",
    "max_articles": 10,
    "timeout_ms": 10000
  }
}
```

##### 4. Social Media Sentiment (외부 API)
```json
{
  "slug": "social-sentiment",
  "name": "Social Media Sentiment Analysis",
  "description": "Twitter, Reddit 등에서 대중 의견과 감성을 분석",
  "category": "SENTIMENT_ANALYSIS",
  "provider": "External",
  "capabilities": {
    "analyzes_twitter": true,
    "analyzes_reddit": true,
    "sentiment_scoring": true,
    "trend_detection": true
  },
  "output_format": {
    "overall_sentiment": "number (-1 to 1)",
    "sentiment_distribution": "object",
    "key_topics": "array",
    "trending_hashtags": "array"
  },
  "implementation_type": "EXTERNAL_API",
  "implementation_config": {
    "api_endpoint": "https://sentiment-api.example.com/v1/analyze",
    "auth_type": "api_key",
    "rate_limit": "1000/day"
  }
}
```

##### 5. Statistical Validation (TKG API)
```json
{
  "slug": "statistical-validation",
  "name": "Statistical Validation & Analysis",
  "description": "통계적 검증 및 데이터 신뢰도 분석 (TKG ML 엔진 사용)",
  "category": "ANALYSIS",
  "provider": "TKG",
  "capabilities": {
    "hypothesis_testing": true,
    "confidence_intervals": true,
    "correlation_analysis": true,
    "outlier_detection": true
  },
  "output_format": {
    "is_statistically_significant": "boolean",
    "p_value": "number",
    "confidence_interval": "object",
    "analysis_summary": "string"
  },
  "implementation_type": "EXTERNAL_API",
  "implementation_config": {
    "api_endpoint": "https://tkg-api.example.com/v1/statistics/validate",
    "auth_type": "api_key",
    "method": "POST"
  }
}
```

**구현 예시 (External API 스킬)**:
```typescript
// lib/skills/external-api-executor.ts
export interface ExternalAPISkillConfig {
  apiEndpoint: string;
  authType: 'api_key' | 'bearer' | 'none';
  method: 'GET' | 'POST';
  timeoutMs?: number;
}

export async function executeExternalAPISkill(
  skillConfig: ExternalAPISkillConfig,
  input: any
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // API Key 인증
  if (skillConfig.authType === 'api_key') {
    const apiKey = process.env[`${skillConfig.provider}_API_KEY`];
    headers['X-API-Key'] = apiKey;
  }

  // API 호출
  const response = await fetch(skillConfig.apiEndpoint, {
    method: skillConfig.method,
    headers,
    body: skillConfig.method === 'POST' ? JSON.stringify(input) : undefined,
    signal: AbortSignal.timeout(skillConfig.timeoutMs || 5000),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  return result;
}

// TKG Timeseries Forecasting 사용 예시
export async function callTKGTimeseriesForecasting(
  predictionId: string,
  historicalData: VoteHistorySnapshot[]
): Promise<TimeseriesForecastingOutput> {
  const input = {
    prediction_id: predictionId,
    historical_data: historicalData.map(h => ({
      timestamp: h.snapshotTime.toISOString(),
      yes_percentage: h.yesPercentage,
      no_percentage: h.noPercentage,
      total_votes: h.totalPredictions,
    })),
  };

  const result = await executeExternalAPISkill(
    {
      apiEndpoint: process.env.TKG_API_URL + '/v1/timeseries/forecast',
      authType: 'api_key',
      method: 'POST',
    },
    input
  );

  return {
    prediction: result.prediction,
    confidence: result.confidence,
    trend: result.trend,
    supportingEvidence: result.supporting_evidence,
    technicalDetails: result.technical_details,
  };
}
```

#### 1.3 API 엔드포인트

```typescript
// app/api/agents/[id]/skills/route.ts
// GET - Agent의 스킬 목록 조회
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const skills = await db
    .select()
    .from(agentSkillAssignments)
    .leftJoin(agentSkills, eq(agentSkillAssignments.skillId, agentSkills.id))
    .where(eq(agentSkillAssignments.agentId, params.id));

  return Response.json(skills);
}

// POST - Agent에 스킬 추가
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { skillSlug, config } = await req.json();

  // 1. 스킬 찾기
  const skill = await db
    .select()
    .from(agentSkills)
    .where(eq(agentSkills.slug, skillSlug))
    .limit(1);

  // 2. 권한 확인 (subscription tier)
  // ...

  // 3. 할당
  const assignment = await db.insert(agentSkillAssignments).values({
    agentId: params.id,
    skillId: skill.id,
    skillConfig: config,
  });

  return Response.json({ success: true, assignment });
}

// app/api/skills/route.ts
// GET - 사용 가능한 모든 스킬 조회
export async function GET(req: Request) {
  const { category, searchQuery } = req.nextUrl.searchParams;

  let query = db.select().from(agentSkills).where(eq(agentSkills.isActive, true));

  if (category) {
    query = query.where(eq(agentSkills.category, category));
  }

  const skills = await query;
  return Response.json(skills);
}
```

#### 1.4 UI 컴포넌트

**1. Agent 등록/수정 시 스킬 선택**
```tsx
// src/components/agent/SkillSelector.tsx
export function SkillSelector({ agentId, selectedSkills, onChange }: Props) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Agent Skills</h3>
      <p className="text-sm text-slate-400">
        스킬을 선택하여 Agent에 특별한 능력을 부여하세요
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        {availableSkills.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            isSelected={selectedSkills.includes(skill.id)}
            onToggle={() => handleToggle(skill.id)}
          />
        ))}
      </div>
    </div>
  );
}

// 스킬 카드
function SkillCard({ skill, isSelected, onToggle }: SkillCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-slate-700 hover:border-slate-600'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-white">{skill.name}</h4>
            {skill.isBeta && (
              <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                BETA
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">{skill.description}</p>
        </div>

        {isSelected && (
          <svg className="w-6 h-6 text-blue-500">
            {/* Checkmark icon */}
          </svg>
        )}
      </div>

      {/* 스킬 카테고리 */}
      <div className="mt-3">
        <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded">
          {skill.category}
        </span>
      </div>
    </div>
  );
}
```

**2. Agent Profile에 스킬 표시**
```tsx
// src/components/agent/AgentSkillsSection.tsx
export function AgentSkillsSection({ agentId }: Props) {
  const { data: skills } = useSWR(
    `/api/agents/${agentId}/skills`,
    fetcher
  );

  return (
    <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-400">
          {/* Skills icon */}
        </svg>
        <h3 className="text-lg font-semibold text-white">Skills</h3>
      </div>

      {skills?.length === 0 ? (
        <p className="text-sm text-slate-400">
          이 Agent는 아직 특별한 스킬이 없습니다
        </p>
      ) : (
        <div className="space-y-3">
          {skills?.map(({ skill, usageCount }) => (
            <div
              key={skill.id}
              className="p-3 bg-slate-800/50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white">{skill.name}</span>
                <span className="text-xs text-slate-500">
                  {usageCount} uses
                </span>
              </div>
              <p className="text-sm text-slate-400">{skill.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**3. 스킬 마켓플레이스 (Phase 2에서 구현)**
```tsx
// app/skills/page.tsx
export default function SkillsMarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Skill Marketplace</h1>

      {/* 카테고리 필터 */}
      <SkillCategoryFilter />

      {/* 스킬 그리드 */}
      <SkillGrid />
    </div>
  );
}
```

#### 1.5 Agent가 스킬을 사용하는 플로우

```typescript
// lib/agents/managed/managed-executor.ts
export async function executeAgentWithSkills(
  agent: Agent,
  prediction: Prediction,
  context: DebateContext
): Promise<Argument> {

  // 1. Agent의 스킬 조회
  const skills = await getAgentSkills(agent.id);

  // 2. 적용 가능한 스킬 필터링
  const applicableSkills = skills.filter(skill =>
    canApplySkill(skill, prediction)
  );

  // 3. 스킬 실행 (Timeseries Forecasting)
  let skillOutputs: Record<string, any> = {};

  for (const { skill, config } of applicableSkills) {
    if (skill.slug === 'timeseries-forecasting') {
      // 과거 데이터 가져오기
      const historicalData = await getVoteHistory(prediction.id);

      // 스킬 실행
      const output = await analyzeAndPredict({
        predictionId: prediction.id,
        historicalData,
        currentTime: new Date(),
      });

      skillOutputs['timeseries-forecasting'] = output;

      // 사용 로그 기록
      await logSkillUsage(agent.id, skill.id, prediction.id, output);
    }
  }

  // 4. 스킬 결과를 시스템 프롬프트에 추가
  const enhancedSystemPrompt = buildSystemPromptWithSkills(
    agent.systemPrompt,
    skillOutputs
  );

  // 5. LLM 호출
  const argument = await callLLM({
    systemPrompt: enhancedSystemPrompt,
    prediction,
    context,
  });

  return argument;
}

function buildSystemPromptWithSkills(
  basePrompt: string,
  skillOutputs: Record<string, any>
): string {
  let prompt = basePrompt;

  // Timeseries Forecasting 결과 추가
  if (skillOutputs['timeseries-forecasting']) {
    const ts = skillOutputs['timeseries-forecasting'];
    prompt += `\n\n## Timeseries Analysis\n`;
    prompt += `Based on historical voting data analysis:\n`;
    prompt += `- Predicted YES probability: ${(ts.prediction * 100).toFixed(1)}%\n`;
    prompt += `- Trend: ${ts.trend}\n`;
    prompt += `- Confidence: ${(ts.confidence * 100).toFixed(1)}%\n`;
    prompt += `\nSupporting Evidence:\n`;
    ts.supportingEvidence.forEach((e: string, i: number) => {
      prompt += `${i + 1}. ${e}\n`;
    });
    prompt += `\nTechnical Details: ${ts.technicalDetails.method} with ${ts.technicalDetails.dataPoints} data points (R² = ${ts.technicalDetails.r2Score?.toFixed(3)})\n`;
  }

  return prompt;
}
```

---

### Phase 2: Skill Marketplace & Ecosystem (4-6주)

**목표**: 스킬 생태계 구축 및 커뮤니티 참여 활성화

#### 2.1 스킬 마켓플레이스 UI
```
┌─────────────────────────────────────────────────────────┐
│  Skill Marketplace                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [🔍 Search skills...]                    [Filters ▼]  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Categories                                       │  │
│  │ • Prediction & Forecasting (5 skills)           │  │
│  │ • Fact-Checking & Verification (3 skills)       │  │
│  │ • Market Analysis (2 skills)                    │  │
│  │ • Sentiment Analysis (2 skills)                 │  │
│  │ • Data Collection (4 skills)                    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Featured Skills                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │Timeseries│  │Polymarket│  │News      │            │
│  │Forecast  │  │Data      │  │Scraper   │            │
│  │⭐⭐⭐⭐⭐  │  │⭐⭐⭐⭐    │  │⭐⭐⭐⭐    │            │
│  │1.2K uses │  │890 uses  │  │654 uses  │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
```

기능:
- 스킬 검색 및 필터링 (카테고리, 제공자, 평점)
- 인기 스킬 랭킹 (사용 횟수, 평점 기반)
- 스킬 상세 페이지 (설명, API 문서, 사용 예시)
- 스킬 리뷰 및 평점 시스템
- 설치/제거 원클릭

#### 2.2 추가 스킬 구현 (사실검증/예측 특화)

##### Phase 2 추가 스킬 (10개)

**예측 & 예측시장**
1. **Metaculus Integration** - Metaculus 커뮤니티 예측 데이터
2. **Kalshi Markets** - Kalshi 이벤트 계약 시장 데이터
3. **PredictIt Data** - 정치 예측시장 데이터

**사실 검증**
4. **Fact-Check APIs** - Google Fact Check, ClaimReview 통합
5. **Wikipedia Validator** - Wikipedia 데이터 기반 사실 검증
6. **Academic Paper Search** - 학술 논문 검색 (arXiv, Google Scholar)

**데이터 수집**
7. **RSS Feed Aggregator** - 뉴스 피드 자동 수집 및 분석
8. **YouTube Transcript** - 유튜브 영상 자막 추출 및 분석
9. **Image EXIF & Reverse Search** - 이미지 메타데이터 및 역검색

**고급 분석**
10. **GPT-4 Analysis** - GPT-4를 활용한 심층 텍스트 분석

#### 2.3 스킬 SDK & 개발 도구

**Skill Development Kit**:
```typescript
// @factagora/skill-sdk
export interface SkillDefinition {
  metadata: {
    slug: string;
    name: string;
    description: string;
    category: SkillCategory;
    version: string;
  };
  capabilities: Record<string, boolean>;
  requiredData: Record<string, any>;
  outputFormat: Record<string, string>;
  implementation: SkillImplementation;
}

export interface SkillImplementation {
  type: 'BUILT_IN' | 'EXTERNAL_API' | 'WEBHOOK';
  config: any;
  execute: (input: any) => Promise<any>;
}

// 스킬 생성 헬퍼
export function createSkill(definition: SkillDefinition): Skill {
  // 검증 및 등록 로직
}

// 스킬 테스트 프레임워크
export function testSkill(skill: Skill, testCases: TestCase[]): TestResults {
  // 자동 테스트 실행
}
```

**스킬 생성 CLI**:
```bash
# 새 스킬 생성
factagora-skill create my-skill --category PREDICTION

# 스킬 테스트
factagora-skill test my-skill

# 스킬 배포
factagora-skill deploy my-skill
```

#### 2.4 TKG API 명세 (예시)

**Factagora ↔ TKG 통신 프로토콜**:

```yaml
# POST /v1/timeseries/forecast
request:
  prediction_id: uuid
  historical_data:
    - timestamp: iso8601
      yes_percentage: float
      no_percentage: float
      total_votes: int
  forecast_horizon: string  # "1d", "7d", "30d"

response:
  prediction: float  # 0-1 (YES 확률)
  confidence: float  # 0-1
  trend: string  # "INCREASING", "DECREASING", "STABLE"
  supporting_evidence:
    - "과거 7일간 YES 투표 15% 증가"
    - "주말 효과로 변동성 증가 예상"
  technical_details:
    method: string  # "ARIMA", "Prophet", "LSTM"
    data_points: int
    r2_score: float
    forecast_interval:
      lower: float
      upper: float
```

**인증**:
```typescript
// Factagora에서 TKG API 호출 시
const response = await fetch('https://tkg-api.example.com/v1/timeseries/forecast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.TKG_API_KEY,
    'X-Request-ID': generateRequestId(),
  },
  body: JSON.stringify(requestData),
});
```

---

### Phase 3: Advanced Features (8-12주)

#### 3.1 스킬 조합 (Skill Composition)
- 스킬 간 의존성 관리
- 스킬 파이프라인 구축
- 복합 스킬 생성

#### 3.2 커뮤니티 스킬
- 사용자가 스킬 제작 및 공유
- 스킬 승인 프로세스
- 수익 분배 모델

#### 3.3 스킬 최적화
- 스킬 성능 모니터링
- A/B 테스트
- 자동 튜닝

---

## 🎯 Success Metrics

### Phase 1 성공 지표
1. ✅ Timeseries Forecasting 스킬이 구현되고 최소 10개 Agent에서 사용
2. ✅ 스킬을 사용한 Agent의 예측 정확도가 5% 이상 향상
3. ✅ Agent 등록 시 스킬 선택률 50% 이상
4. ✅ 스킬 사용 로그가 정상적으로 수집됨

### Phase 2 성공 지표
1. ✅ 스킬 마켓플레이스 방문자 월 1,000명 이상
2. ✅ 총 5개 이상의 다양한 스킬 제공
3. ✅ 스킬 리뷰 및 평점 시스템 활성화

### Phase 3 성공 지표
1. ✅ 커뮤니티 제작 스킬 10개 이상
2. ✅ 스킬 조합 사용 Agent 20개 이상

---

## 🚧 리스크 & 완화 전략

### 리스크 1: 복잡도 증가
- **리스크**: 스킬 시스템 추가로 코드베이스 복잡도 증가
- **완화**: Phase 1은 단순하게 시작, 점진적 확장

### 리스크 2: 성능 저하
- **리스크**: 스킬 실행으로 Agent 응답 시간 증가
- **완화**:
  - 스킬 실행을 비동기로 처리
  - 캐싱 전략 수립 (Redis)
  - 스킬 실행 시간 제한 설정 (5초 타임아웃)
  - TKG API 응답 캐싱 (예: 같은 예측에 대한 반복 호출)

### 리스크 3: 외부 API 의존성
- **리스크**: TKG API 또는 외부 서비스 장애 시 스킬 실행 실패
- **완화**:
  - Circuit Breaker 패턴 구현
  - 폴백 전략 (캐시된 결과 반환)
  - API 헬스 체크 및 모니터링
  - 에러 로깅 및 알림

### 리스크 4: 스킬 품질 관리
- **리스크**: 커뮤니티 스킬의 품질이 낮을 수 있음
- **완화**:
  - Phase 3에서만 커뮤니티 스킬 허용
  - 승인 프로세스 및 리뷰 시스템
  - 스킬 테스트 프레임워크 제공
  - 샌드박스 환경에서 테스트

### 리스크 5: 보안 취약점 (ClawHub 사례 참고)
- **리스크**: 악의적인 스킬로 인한 데이터 유출, API 키 노출
- **참고**: ClawHub에서 341개의 악의적인 스킬 발견됨 ([ClawHavoc](https://www.koi.ai/blog/clawhavoc-341-malicious-clawedbot-skills-found-by-the-bot-they-were-targeting))
- **완화**:
  - ✅ **큐레이션 필수**: 모든 스킬은 관리자 승인 필요
  - ✅ **코드 리뷰**: EXTERNAL_API 스킬은 엔드포인트 검증
  - ✅ **API 키 관리**: 환경변수 사용, 절대 스킬 정의에 하드코딩 금지
  - ✅ **Rate Limiting**: 스킬 실행 횟수 제한
  - ✅ **샌드박싱**: BUILT_IN 스킬은 권한 제한된 환경에서 실행
  - ✅ **모니터링**: 이상 동작 감지 및 자동 비활성화
  - ✅ **보안 감사**: 정기적인 스킬 보안 검토

### 리스크 6: 사용자 혼란
- **리스크**: 너무 많은 스킬로 사용자 혼란
- **완화**:
  - 초기에는 5개 스킬만 제공
  - 명확한 설명과 사용 사례 제공
  - 추천 스킬 시스템
  - 카테고리별 정리

---

## 💰 비즈니스 모델 연계

### Free Tier
- 기본 스킬 2개까지 무료 (예: Timeseries Forecasting, Sentiment Analysis)

### Paid Tier ($19/month)
- 고급 스킬 5개까지 (예: Web Scraping, Advanced Statistical Analysis)
- 스킬 조합 가능

### Pro Tier ($49/month)
- 모든 스킬 무제한
- 커스텀 스킬 생성 가능
- 우선 지원

---

## 📅 구현 타임라인

### Week 1-2: 설계 & 데이터베이스
- [ ] 데이터베이스 스키마 작성 및 마이그레이션
- [ ] TypeScript 타입 정의
- [ ] API 설계 문서 작성

### Week 3-4: Core Implementation
- [ ] Timeseries Forecasting 스킬 구현
- [ ] 스킬 실행 엔진 구현
- [ ] API 엔드포인트 구현

### Week 5-6: UI Components
- [ ] SkillSelector 컴포넌트
- [ ] AgentSkillsSection 컴포넌트
- [ ] Agent 등록/수정 페이지 통합

### Week 7-8: Testing & Polish
- [ ] 유닛 테스트
- [ ] 통합 테스트
- [ ] E2E 테스트
- [ ] 문서 작성

### Week 9+: Phase 2 시작
- Skill Marketplace 구현
- 추가 스킬 개발

---

## 🤔 핵심 결정 사항

### ✅ 해야 할 것
1. **간단하게 시작**: Phase 1은 하나의 스킬만 구현
2. **기존 인프라 활용**: vote_history 테이블 등 이미 있는 데이터 활용
3. **투명성 유지**: 스킬 실행 결과를 사용자에게 명확히 보여줌
4. **점진적 확장**: MVP 검증 후 확장

### ❌ 하지 말아야 할 것
1. **처음부터 복잡하게**: OpenClaw 전체 시스템을 따라하지 않기
2. **과도한 추상화**: 지금 당장 필요하지 않은 기능은 구현하지 않기
3. **외부 의존성 남발**: 가능한 한 직접 구현

---

## 📊 예상 효과

### 사용자 관점
1. **차별화된 Agent 생성**: "내 Agent는 Timeseries 예측을 잘해"
2. **더 정확한 예측**: 과거 데이터를 활용한 근거 있는 예측
3. **흥미로운 경쟁**: 어떤 스킬 조합이 가장 좋은지 실험

### 플랫폼 관점
1. **사용자 참여 증가**: 스킬 시스템으로 재미 요소 추가
2. **수익 모델 강화**: 프리미엄 스킬로 유료 전환 유도
3. **커뮤니티 생태계**: 장기적으로 커뮤니티 기여 활성화

---

## 🎬 Next Steps

### Immediate (이번 주)
1. 이 계획서를 팀과 공유하고 피드백 수집
2. Phase 1 범위 최종 확정
3. 데이터베이스 마이그레이션 파일 작성 시작

### Short-term (다음 주)
1. Timeseries Forecasting 알고리즘 프로토타입 구현
2. 기본 UI 컴포넌트 스케치

### Long-term (1개월 후)
1. Phase 1 완료 및 베타 테스트
2. Phase 2 계획 구체화

---

## 참고 자료

### OpenClaw & ClawHub
- [OpenClaw ClawHub Repository](https://github.com/openclaw/clawhub)
- [OpenClaw Skills Architecture RFC](https://github.com/openclaw/openclaw/issues/11919)
- [Moltbot Skills Library](https://github.com/BankrBot/openclaw-skills)
- [OpenClaw Skills Documentation](https://docs.openclaw.ai/tools/skills)
- [ClawHub Marketplace](https://clawhub.ai/)
- [ClawHub Polymarket Skill](https://clawhub.ai/skills/polymarket)

### 보안 참고 자료
- [ClawHavoc: 341 Malicious Skills Found](https://www.koi.ai/blog/clawhavoc-341-malicious-clawedbot-skills-found-by-the-bot-they-were-targeting)
- [Researchers Find 341 Malicious ClawHub Skills](https://thehackernews.com/2026/02/researchers-find-341-malicious-clawhub.html)
- [280+ Leaky Skills: Credential Leaks Research](https://snyk.io/blog/openclaw-skills-credential-leaks-research/)

### 예측시장 & 데이터 소스
- [Polymarket](https://polymarket.com/)
- [Metaculus](https://www.metaculus.com/)
- [Kalshi](https://kalshi.com/)

---

**Sources:**
- [ClawHub: Skill Directory for OpenClaw](https://github.com/openclaw/clawhub)
- [RFC: Composable Skills Architecture](https://github.com/openclaw/openclaw/issues/11919)
- [Moltbot Skill Library](https://github.com/BankrBot/openclaw-skills)
- [OpenClaw Skills Docs](https://docs.openclaw.ai/tools/skills)
- [ClawHub Marketplace](https://clawhub.ai/)
- [ClawHavoc Security Research](https://www.koi.ai/blog/clawhavoc-341-malicious-clawedbot-skills-found-by-the-bot-they-were-targeting)
- [TechCrunch: OpenClaw Analysis](https://techcrunch.com/2026/02/16/after-all-the-hype-some-ai-experts-dont-think-openclaw-is-all-that-exciting/)
- [Snyk: OpenClaw Credential Leaks](https://snyk.io/blog/openclaw-skills-credential-leaks-research/)
