# Factagora 전략 수정안 (Temporal Knowledge Graph 연동)

> **Version**: 2.0.0
> **Date**: 2026-02-07
> **Based on**: live-article 프로젝트 + TKG 핵심 기술 + 비즈니스 모델 분석

---

## 📌 Executive Summary

**핵심 전략 변경**:
- **기술 스택**: live-article 기반 (Next.js + Supabase + Azure) 재사용
- **차별화 요소**: Temporal Knowledge Graph (TKG)를 활용한 "검증된 사실 DB" 전략
- **비즈니스 모델**: B2B SaaS (AI 프로젝트용 Source of Truth API) + B2C Freemium
- **핵심 KPI**: API 유료 구독 MRR (AI 개발자/기업 타겟)

---

## Part 1: 기술 스택 조정 (live-article 기반)

### 1.1 현재 live-article 스택 재사용

| 레이어 | 기술 | 이유 |
|--------|------|------|
| **Frontend** | Next.js 15 + React 19 + TypeScript | 기존 코드 재사용 |
| **Backend** | Next.js API Routes (현재) + FastAPI (선택적) | Next.js로 시작, 필요시 FastAPI 추가 |
| **Database** | Supabase (PostgreSQL) | 기존 Supabase 계정 활용 |
| **Deployment** | Azure App Service (or VM) | 기존 Azure 인프라 재사용 |
| **Auth** | NextAuth v5 (Google OAuth) | live-article과 동일 |
| **Storage** | Supabase Storage | 기존 설정 그대로 |
| **UI** | shadcn/ui + Tailwind CSS | live-article 디자인 시스템 |
| **Graph** | `reagraph` (already installed!) | live-article에서 이미 사용 중 |
| **i18n** | next-intl | 다국어 지원 유지 |

**핵심**: live-article의 95%는 그대로 사용 가능. "FactBlock → Agenda"로 도메인만 변경하면 됨.

### 1.2 Temporal Knowledge Graph 통합 레이어

```typescript
// 기존 live-article FactBlock 구조를 확장
interface Agenda extends FactBlock {
  // 기존 FactBlock 필드
  id: string;
  title: string;
  content: string;
  type: 'fact' | 'prediction' | 'analysis';  // Factagora의 agenda_type과 매핑
  created_at: Date;
  relationships: Relationship[];

  // Factagora 전용 추가 필드
  agenda_type: 'fact_verification' | 'future_prediction';
  conclusion_label: 'true' | 'false' | 'uncertain' | null;
  conclusion_score: number;  // 0-100
  evidence_count: number;
  vote_count: number;
  lifecycle_status: 'open' | 'deliberation' | 'concluded';

  // TKG 연동 필드
  tkg_node_id?: string;  // TKG에서의 노드 ID
  tkg_sync_status: 'pending' | 'synced' | 'failed';
  tkg_synced_at?: Date;
}
```

### 1.3 TKG 전용 서비스 레이어

```typescript
// src/services/tkg-sync.service.ts
export class TKGSyncService {
  /**
   * Agenda가 "concluded" 상태가 되면 TKG로 동기화
   */
  async syncConcludedAgenda(agenda: Agenda): Promise<void> {
    if (agenda.lifecycle_status !== 'concluded') {
      throw new Error('Agenda must be concluded before TKG sync');
    }

    // 1. TKG에 노드 생성
    const tkg_node = await this.createTKGNode({
      claim: agenda.title,
      conclusion: agenda.conclusion_label,
      confidence: agenda.conclusion_score / 100,
      evidence_urls: await this.getEvidenceUrls(agenda.id),
      concluded_at: new Date(),
      source: 'factagora',
      metadata: {
        vote_count: agenda.vote_count,
        evidence_count: agenda.evidence_count,
        agenda_id: agenda.id
      }
    });

    // 2. Agenda와 TKG 노드 연결
    await this.updateAgendaTKGMapping(agenda.id, tkg_node.id);

    // 3. 관련 Agenda들의 TKG 관계 업데이트
    await this.syncRelationships(agenda.id, tkg_node.id);
  }

  /**
   * 다른 AI 프로젝트가 TKG API를 통해 검증된 사실 조회
   */
  async queryVerifiedFacts(query: string): Promise<TKGNode[]> {
    return await fetch('/api/tkg/query', {
      method: 'POST',
      body: JSON.stringify({ query, source: 'factagora' })
    }).then(r => r.json());
  }
}
```

### 1.4 FastAPI 백엔드 선택 사항

**언제 FastAPI를 추가해야 하는가?**

| 시나리오 | 권장 |
|----------|------|
| MVP (0-3개월) | Next.js API Routes만 사용 ✅ |
| TKG 쿼리 API가 복잡해질 때 | FastAPI 추가 고려 |
| Python ML 모델 통합 필요 시 | FastAPI 추가 필요 |
| API 요청 > 1,000 req/min | FastAPI로 분리 필요 |

**FastAPI 추가 시 아키텍처**:
```
┌──────────────┐
│   Next.js    │  (Frontend + Auth + CRUD)
│   Azure App  │
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌────┐   ┌──────────┐
│ DB │◄──│ FastAPI  │  (TKG Query API + ML)
└────┘   │ Azure VM │
         └──────────┘
```

---

## Part 2: Temporal Knowledge Graph 연동 전략

### 2.1 TKG의 역할: Factagora의 핵심 차별화

**기존 문제**:
- Moltbook: AI 소셜 네트워크 → 단순 채팅, 지식 축적 없음
- Metaculus/Kalshi: 예측 시장 → 과거 결론 재사용 어려움
- Community Notes: 팩트체크 → 개별 노트, 체계화 안 됨

**Factagora + TKG 해법**:
```
┌─────────────┐
│  Factagora  │  (집단지성 결론 도출)
│  Platform   │
└──────┬──────┘
       │ Concluded Agenda
       ▼
┌──────────────┐
│  Temporal    │  (검증된 사실 DB)
│  Knowledge   │  - 시계열 사실 저장
│  Graph (TKG) │  - 사실 간 관계 저장
└──────┬───────┘
       │ API
       ▼
┌──────────────┐
│  AI Projects │  (Source of Truth)
│  - RAG       │  - 환각 방지
│  - Chatbots  │  - 사실 근거 제공
│  - LLM Apps  │  - 시간축 추론
└──────────────┘
```

### 2.2 TKG 데이터 구조 (확장)

#### 기존 live-article의 `relationships` 활용

live-article은 이미 FactBlock 간 관계를 다룹니다:

```typescript
// live-article 기존 구조
relationship_type: 'supports' | 'contradicts' | 'relates_to' | 'derives_from'
```

#### Factagora에서 확장

```typescript
// Factagora 확장 관계 타입
relationship_type:
  | 'supports'        // Evidence가 Agenda를 지지
  | 'contradicts'     // Evidence가 Agenda를 반박
  | 'relates_to'      // 관련 Agenda
  | 'derives_from'    // 하위 Sub-Agenda
  | 'temporal_before' // 시계열: A가 B보다 먼저 발생
  | 'temporal_after'  // 시계열: A가 B보다 나중 발생
  | 'causal'          // 인과 관계: A가 B를 야기
  | 'prerequisite'    // 선행 조건: A가 B의 전제
```

### 2.3 TKG API 설계 (B2B 수익화 핵심)

#### Public API (무료 Tier)

```http
GET /api/v1/tkg/facts?query=Tesla+2025+revenue
Authorization: Bearer {API_KEY_FREE}
X-RateLimit: 100 requests/day

Response:
{
  "facts": [
    {
      "claim": "Tesla의 2025년 매출이 $100B를 초과했는가?",
      "conclusion": "true",
      "confidence": 0.78,
      "verified_at": "2026-02-01T00:00:00Z",
      "evidence_count": 42,
      "vote_count": 127,
      "source_url": "https://factagora.com/a/finance/agenda/tesla-2025-revenue"
    }
  ],
  "usage": {
    "requests_today": 23,
    "limit": 100
  }
}
```

#### Premium API (유료 Tier)

```http
POST /api/v1/tkg/reasoning-chain
Authorization: Bearer {API_KEY_PREMIUM}
X-RateLimit: 10,000 requests/day

Request:
{
  "query": "Will Tesla reach $150B revenue in 2026?",
  "include_temporal": true,
  "include_causal": true
}

Response:
{
  "conclusion": "uncertain (55% likely)",
  "reasoning_chain": [
    {
      "fact": "Tesla 2025 revenue was $112B (verified)",
      "relationship": "temporal_before",
      "confidence": 0.92
    },
    {
      "fact": "Tesla's YoY growth averaged 28% (2023-2025)",
      "relationship": "causal",
      "confidence": 0.81
    },
    {
      "fact": "Automotive market expected to grow 12% in 2026",
      "relationship": "prerequisite",
      "confidence": 0.67
    }
  ],
  "similar_predictions": [...]
}
```

### 2.4 다른 AI 프로젝트와의 연동 시나리오

#### Scenario 1: RAG 시스템 환각 방지

```python
# AI 프로젝트에서 Factagora TKG API 호출
import requests

def verify_claim_with_factagora(claim: str):
    response = requests.get(
        "https://api.factagora.com/v1/tkg/facts",
        params={"query": claim},
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    facts = response.json()["facts"]

    if facts:
        verified = facts[0]
        if verified["confidence"] > 0.8:
            return f"✅ Verified: {verified['conclusion']} (source: Factagora)"

    return "⚠️ Unverified claim - proceed with caution"

# RAG 응답에 검증 레이어 추가
rag_response = generate_rag_response(query)
verification = verify_claim_with_factagora(rag_response)
final_response = f"{rag_response}\n\n{verification}"
```

#### Scenario 2: Temporal Reasoning

```python
# 시간축 추론이 필요한 예측 AI
def predict_with_temporal_context(query: str):
    # Factagora TKG에서 시계열 관련 사실 가져오기
    response = requests.post(
        "https://api.factagora.com/v1/tkg/reasoning-chain",
        json={
            "query": query,
            "include_temporal": True,
            "time_range": "2020-2026"
        },
        headers={"Authorization": f"Bearer {API_KEY}"}
    )

    reasoning = response.json()["reasoning_chain"]

    # 시계열 패턴 분석
    trends = analyze_temporal_patterns(reasoning)
    prediction = extrapolate_future(trends)

    return {
        "prediction": prediction,
        "confidence": reasoning["confidence"],
        "based_on_facts": len(reasoning["reasoning_chain"])
    }
```

---

## Part 3: 비즈니스 모델 분석 및 전략 선택

### 3.1 두 가지 전략 비교

| 전략 | 타겟 | 수익 모델 | 성장 동력 | 초기 난이도 |
|------|------|-----------|-----------|-------------|
| **A. B2C 트래픽** | 일반 사용자 | 광고 수익 | 바이럴, SEO | 높음 (Cold Start) |
| **B. B2B API** | AI 개발자/기업 | API 구독료 | Product-Led Growth | 중간 (니치 시장) |

### 3.2 권장 전략: **Hybrid (B2B 우선 + B2C 보조)**

**핵심 인사이트**: Factagora의 진짜 가치는 "검증된 사실 DB"이다.

```
Phase 1 (0-6개월): B2B API 수익화 집중
├── Target: AI 스타트업, RAG 개발자, LLM 앱 빌더
├── KPI: MRR (Monthly Recurring Revenue)
└── Goal: $10K MRR (= 100개 기업 × $100/월)

Phase 2 (6-12개월): B2C 트래픽 확대
├── Target: 투자자, 팩트체커, 일반 대중
├── KPI: MAU (Monthly Active Users)
└── Goal: 10,000 MAU (플랫폼 신뢰도 향상 → API 가치 증가)

Phase 3 (12개월+): 선순환 구조
├── B2C 참여 증가 → TKG 데이터 품질 향상 → B2B API 가치 증가
└── B2B 수익 → 플랫폼 개선 → B2C 사용자 경험 향상
```

### 3.3 Pricing 전략

#### B2B API Pricing (핵심 수익원)

| Tier | 가격 | API 호출 | 지원 | 타겟 |
|------|------|----------|------|------|
| **Free** | $0/월 | 100 req/day | 커뮤니티 | 개인 개발자, POC |
| **Starter** | $99/월 | 10K req/day | 이메일 | 스타트업 (Seed~Series A) |
| **Pro** | $499/월 | 100K req/day | 우선 지원 | 성장 기업 (Series B~C) |
| **Enterprise** | Custom | Unlimited | 전담 팀 | 대기업 (API 통합) |

**예상 ARR (1년 후)**:
- Free: 500 users × $0 = $0
- Starter: 50 users × $99 × 12 = $59,400
- Pro: 10 users × $499 × 12 = $59,880
- Enterprise: 3 users × $5,000 × 12 = $180,000
- **Total ARR**: ~$300K (30만 달러)

#### B2C Freemium (보조 수익)

| Tier | 가격 | 기능 | 타겟 |
|------|------|------|------|
| **Free** | $0/월 | 읽기, 투표 (Quick Vote) | 일반 사용자 |
| **Plus** | $9/월 | Evidence 제출, Agenda 생성 (무제한) | 파워 유저 |
| **Pro** | $29/월 | AI 분석 우선 실행, 고급 시각화 | 투자자, 리서처 |

**예상 수익 (1년 후, 10K MAU 가정)**:
- Free: 9,000 users × $0 = $0
- Plus: 800 users × $9 × 12 = $86,400
- Pro: 200 users × $29 × 12 = $69,600
- **Total ARR**: ~$156K (16만 달러)

**Total ARR (B2B + B2C)**: ~$456K (46만 달러) at Year 1

### 3.4 수익화 우선순위

```
P0 (MVP부터 구현):
✅ API Key 생성 & Rate Limiting
✅ Stripe 연동 (API 구독)
✅ Usage Tracking (API 호출 모니터링)
✅ TKG Public API (무료 Tier)

P1 (3개월 후):
□ Premium API (Reasoning Chain)
□ B2C Freemium Paywall
□ Self-serve 결제 플로우

P2 (6개월 후):
□ Enterprise Sales Pipeline
□ Custom Integration Support
□ White-label API
```

---

## Part 4: 핵심 KPI 및 팀 인센티브 설계

### 4.1 핵심 KPI (비즈니스 모델에 맞춤)

#### Primary KPI (보너스 지급 기준)

**Phase 1 (0-6개월): B2B API 집중**

| KPI | 목표 (6개월) | 측정 방법 | 보너스 기준 |
|-----|--------------|-----------|-------------|
| **MRR** | $10,000/월 | Stripe Dashboard | $5K: 50%, $10K: 100%, $15K: 150% |
| **Active API Customers** | 100개 기업 | Supabase `api_keys` 테이블 | 50개: 50%, 100개: 100%, 150개: 150% |
| **API Call Volume** | 1M calls/월 | Monitoring Dashboard | 500K: 50%, 1M: 100%, 2M: 150% |

**Phase 2 (6-12개월): B2C 성장**

| KPI | 목표 (12개월) | 측정 방법 | 보너스 기준 |
|-----|---------------|-----------|-------------|
| **MAU** | 10,000 | Supabase Auth Logs | 5K: 50%, 10K: 100%, 15K: 150% |
| **Concluded Agendas** | 500개 | `agendas WHERE status='concluded'` | 250: 50%, 500: 100%, 750: 150% |
| **TKG Sync Rate** | 95% | `tkg_sync_status='synced'` count | 85%: 50%, 95%: 100%, 99%: 150% |

#### Secondary KPI (모니터링용, 보너스 X)

- **D7 Retention**: > 30%
- **API Response Time (p95)**: < 200ms
- **Churn Rate**: < 5%/월
- **NPS**: > 40

### 4.2 팀 인센티브 구조

#### 보너스 Pool 설계

```
Total Revenue × 20% = Bonus Pool

예시:
- 6개월 후 MRR $10K → ARR $120K → Bonus Pool = $24K
- 12개월 후 ARR $456K → Bonus Pool = $91K

분배:
- 팀 전체 공통: 50% (KPI 달성 시)
- 개인 기여도: 30% (역할별 목표 달성)
- CEO 재량: 20% (특별 기여 인정)
```

#### 역할별 목표 (개인 30% 배분용)

| 역할 | Primary 목표 | Metric |
|------|-------------|--------|
| **Backend Dev** | API 안정성 99.9% | Uptime, p95 latency < 200ms |
| **Frontend Dev** | B2C MAU 10K | Google Analytics |
| **Product Manager** | MRR $10K | Stripe Dashboard |
| **Growth Hacker** | API Customer 100개 | CRM + Supabase |
| **DevOps** | TKG Sync Rate 95% | Monitoring Dashboard |

### 4.3 KPI 대시보드 구현

```typescript
// src/app/admin/kpi/page.tsx
export default async function KPIDashboard() {
  const [mrr, apiCustomers, apiCalls] = await Promise.all([
    getMRR(), // Stripe API
    getActiveAPICustomers(), // Supabase
    getAPICallVolume() // Monitoring
  ]);

  return (
    <div>
      <h1>Factagora KPI Dashboard</h1>

      {/* Phase 1: B2B API */}
      <KPICard
        title="MRR"
        value={mrr}
        target={10000}
        unit="USD"
        bonus={calculateBonus(mrr, 10000)}
      />

      <KPICard
        title="Active API Customers"
        value={apiCustomers}
        target={100}
        unit="customers"
        bonus={calculateBonus(apiCustomers, 100)}
      />

      {/* ... */}
    </div>
  );
}
```

---

## Part 5: 수정된 MVP 로드맵 (14주 → 12주)

### Phase 0: Pre-Launch (Week 0-2) — TKG 설계 우선

| Week | 활동 | 산출물 |
|------|------|--------|
| Week 1 | TKG 스키마 설계 + API 스펙 작성 | `docs/tkg-schema.md` |
| Week 1 | live-article 복제 + Factagora 브랜딩 | `factagora-mvp/` 프로젝트 |
| Week 2 | API Key 생성 시스템 (Stripe 연동) | `/api/auth/api-keys` |
| Week 2 | 랜딩페이지 (B2B API 중심) | factagora.com |

### Phase 1: MVP Build (Week 3-6) — live-article 기반

| Week | Backend (API) | Frontend (Platform) |
|------|---------------|---------------------|
| Week 3 | Agenda CRUD + Vote API | Agenda 피드 + Quick Vote UI |
| Week 4 | Evidence API + TKG Sync | Evidence 제출 + 시각화 |
| Week 5 | TKG Query API (Public) | API Docs + Playground |
| Week 6 | Rate Limiting + Usage Tracking | Seed 50 Agendas + Alpha Launch |

**Success Criteria (Week 6)**:
- ✅ 10개 AI 개발자가 API 사용 (무료 Tier)
- ✅ 5개 Agenda가 Concluded 상태 도달
- ✅ TKG에 50개 검증된 사실 저장

### Phase 2: Growth (Week 7-12) — B2B 집중

| Week | B2B API | B2C Platform |
|------|---------|--------------|
| Week 7-8 | Premium API (Reasoning Chain) | Trust Score + 3-Tier 권한 |
| Week 9-10 | Enterprise Tier 출시 | Prediction Agenda + 시계열 차트 |
| Week 11-12 | Monitoring Dashboard | B2C Freemium Paywall |

**Success Criteria (Week 12)**:
- ✅ MRR $1,000 (= 10개 기업 × $99/월 Starter)
- ✅ 100개 Concluded Agendas
- ✅ 500 MAU (B2C)

---

## Part 6: 기술 스택 최종 요약

### 6.1 재사용 가능한 live-article 컴포넌트

| 컴포넌트 | live-article | Factagora 전환 |
|---------|--------------|----------------|
| **Auth** | NextAuth + Google OAuth | 그대로 재사용 ✅ |
| **DB** | Supabase (PostgreSQL) | 그대로 재사용 ✅ |
| **UI** | shadcn/ui + Tailwind | 그대로 재사용 ✅ |
| **Graph** | `reagraph` | 그대로 재사용 ✅ |
| **i18n** | next-intl | 그대로 재사용 ✅ |
| **Payments** | Stripe | 그대로 재사용 ✅ |
| **FactBlock** | 투자 리서치 기사용 | → **Agenda** (팩트체크용) |
| **Collection** | 기사 모음 | → **Agora** (커뮤니티) |

### 6.2 추가 개발 필요 항목

| 항목 | 난이도 | 예상 시간 |
|------|--------|-----------|
| Vote 시스템 (Quick Vote) | 중 | 1주 |
| TKG Sync Service | 중-고 | 2주 |
| TKG Query API | 고 | 2주 |
| API Key 관리 | 중 | 1주 |
| Rate Limiting | 중 | 3일 |
| Usage Tracking | 중 | 3일 |
| **Total** | - | **6주** |

### 6.3 비용 절감 (live-article 재사용)

| 항목 | 처음부터 개발 | live-article 재사용 | 절감 |
|------|---------------|---------------------|------|
| Frontend 기본 구조 | 4주 | 0주 | 4주 |
| Auth 시스템 | 1주 | 0주 | 1주 |
| DB 스키마 | 1주 | 3일 (수정) | 4일 |
| UI 컴포넌트 | 2주 | 0주 | 2주 |
| 배포 설정 (Azure) | 3일 | 0일 | 3일 |
| **Total** | **8.5주** | **0.5주** | **8주 절감** |

---

## Part 7: TKG 연동 상세 설계

### 7.1 TKG 데이터 모델 (PostgreSQL 확장)

```sql
-- live-article의 factblocks 테이블 확장
CREATE TABLE agendas (
  -- 기존 FactBlock 필드
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'fact',  -- fact, prediction, analysis
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Factagora 전용 필드
  agenda_type TEXT DEFAULT 'fact_verification',
  conclusion_label TEXT,  -- true, false, uncertain
  conclusion_score DECIMAL(5,2),
  evidence_count INT DEFAULT 0,
  vote_count INT DEFAULT 0,
  lifecycle_status TEXT DEFAULT 'open',

  -- TKG 연동 필드
  tkg_node_id UUID,
  tkg_sync_status TEXT DEFAULT 'pending',
  tkg_synced_at TIMESTAMPTZ,
  tkg_metadata JSONB
);

-- TKG 노드 캐시 테이블 (API 응답 속도 향상)
CREATE TABLE tkg_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim TEXT NOT NULL,
  conclusion TEXT NOT NULL,  -- true, false, uncertain
  confidence DECIMAL(5,2) NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL,
  evidence_urls TEXT[],
  source TEXT DEFAULT 'factagora',
  metadata JSONB,

  -- 시계열 필드
  temporal_context JSONB,  -- {before: [], after: [], causal: []}

  -- 검색 최적화
  claim_vector vector(1536),  -- OpenAI embedding

  UNIQUE(claim, verified_at)
);

-- TKG 관계 테이블
CREATE TABLE tkg_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID REFERENCES tkg_nodes(id),
  target_node_id UUID REFERENCES tkg_nodes(id),
  relationship_type TEXT NOT NULL,
  confidence DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source_node_id, target_node_id, relationship_type)
);

-- 인덱스
CREATE INDEX idx_tkg_nodes_claim ON tkg_nodes USING GIN (to_tsvector('english', claim));
CREATE INDEX idx_tkg_nodes_verified_at ON tkg_nodes(verified_at DESC);
CREATE INDEX idx_tkg_relationships_source ON tkg_relationships(source_node_id);
CREATE INDEX idx_tkg_relationships_target ON tkg_relationships(target_node_id);
```

### 7.2 TKG Sync 워크플로우

```typescript
// src/services/tkg-sync.service.ts
export class TKGSyncService {
  async onAgendaConcluded(agenda_id: string) {
    // 1. Agenda 데이터 조회
    const agenda = await supabase
      .from('agendas')
      .select('*, evidence(*), votes(*)')
      .eq('id', agenda_id)
      .single();

    if (agenda.lifecycle_status !== 'concluded') {
      throw new Error('Agenda must be concluded');
    }

    // 2. TKG 노드 생성
    const tkg_node = {
      claim: agenda.title,
      conclusion: agenda.conclusion_label,
      confidence: agenda.conclusion_score / 100,
      verified_at: new Date(),
      evidence_urls: agenda.evidence.map(e => e.source_url),
      source: 'factagora',
      metadata: {
        agenda_id: agenda.id,
        vote_count: agenda.vote_count,
        evidence_count: agenda.evidence_count
      }
    };

    const { data: node } = await supabase
      .from('tkg_nodes')
      .insert(tkg_node)
      .select()
      .single();

    // 3. Agenda와 TKG 노드 매핑
    await supabase
      .from('agendas')
      .update({
        tkg_node_id: node.id,
        tkg_sync_status: 'synced',
        tkg_synced_at: new Date()
      })
      .eq('id', agenda_id);

    // 4. 관련 Agenda들의 TKG 관계 생성
    await this.syncRelationships(agenda, node);

    // 5. Embedding 생성 (검색 최적화)
    await this.generateEmbedding(node.id, node.claim);
  }

  async syncRelationships(agenda: Agenda, tkg_node: TKGNode) {
    // live-article의 relationships 테이블 활용
    const relationships = await supabase
      .from('relationships')
      .select('*, target_agenda:target_id(*)')
      .eq('source_id', agenda.id);

    for (const rel of relationships) {
      if (!rel.target_agenda.tkg_node_id) continue;

      await supabase
        .from('tkg_relationships')
        .insert({
          source_node_id: tkg_node.id,
          target_node_id: rel.target_agenda.tkg_node_id,
          relationship_type: rel.relationship_type,
          confidence: 0.85  // TODO: 동적 계산
        });
    }
  }
}
```

### 7.3 TKG Query API 구현

```typescript
// src/app/api/v1/tkg/facts/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const api_key = request.headers.get('authorization')?.replace('Bearer ', '');

  // 1. API Key 검증 + Rate Limiting
  const user = await validateAPIKey(api_key);
  await checkRateLimit(user.id, user.tier);

  // 2. TKG 검색 (Vector Search)
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query
  });

  const { data: facts } = await supabase.rpc('search_tkg_nodes', {
    query_embedding: embedding.data[0].embedding,
    match_threshold: 0.8,
    match_count: 10
  });

  // 3. Usage Tracking
  await trackAPIUsage(user.id, 'tkg_facts', 1);

  // 4. Response
  return NextResponse.json({
    facts: facts.map(f => ({
      claim: f.claim,
      conclusion: f.conclusion,
      confidence: f.confidence,
      verified_at: f.verified_at,
      evidence_count: f.metadata.evidence_count,
      source_url: `https://factagora.com/agenda/${f.metadata.agenda_id}`
    })),
    usage: await getUsageStats(user.id)
  });
}
```

---

## Part 8: 비즈니스 모델 실행 계획

### 8.1 B2B API Go-to-Market 전략

#### Target Segment 1: AI 스타트업 (Seed ~ Series A)

**Why they need Factagora**:
- RAG 시스템 환각 방지
- 시간축 추론 (temporal reasoning) 필요
- 사실 검증 비용 절감

**Outreach 전략**:
```
Week 1-2:
- Y Combinator, AI Grant 배치 스타트업 리스트 확보
- LinkedIn에서 CTO, AI Lead 연락
- 이메일: "Your RAG system is hallucinating. Here's how we can help."

Week 3-4:
- Product Hunt 론칭 (B2B API 중심)
- Hacker News: "Show HN: Factagora — Verified Facts API for AI Apps"
- AI Discord 커뮤니티 참여 (Eleuther, Hugging Face)

Week 5-8:
- 10개 Design Partner 확보 (무료 → Starter 전환)
- Case Study 작성 (예: "How [Startup] reduced RAG hallucinations by 40%")
- Referral Program: 추천 1개당 $50 credit
```

#### Target Segment 2: LLM 앱 빌더 (개인 개발자)

**Why they need Factagora**:
- GPT Wrapper 앱의 신뢰도 향상
- Custom GPT에서 검증된 사실 활용

**Outreach 전략**:
- X/Twitter: "@OpenAI developers — tired of hallucinations? Try Factagora API"
- Reddit r/LangChain, r/OpenAI
- Indie Hackers: "Show IH: Verified Facts API for $99/mo"

### 8.2 B2C Platform 성장 전략 (Growth Hacking Review 반영)

#### Quick Wins (MVP부터)

1. **Quick Vote + Seed Agendas** (Growth Hacking P0)
   - 50개 Seed Agenda (AI가 사전 분석 완료)
   - 3-button Quick Vote (2분 안에 첫 투표)

2. **Public Pages + SEO** (Reality Check + Growth Hacking)
   - `/agenda/[id]` 페이지를 public으로 노출
   - Schema.org ClaimReview markup
   - Google 검색: "Is [claim] true?"

3. **Conclusion Card 공유** (Growth Hacking P0)
   - 투표 후 자동 생성되는 공유 카드
   - Twitter/LinkedIn OG 이미지 최적화

#### Medium-term (3-6개월)

4. **Bowling Pin 타겟** (Growth Hacking P7)
   - AI/Tech 커뮤니티 → 팩트체커 → 투자자
   - Hacker News, r/MachineLearning 우선

5. **Daily Verdict 알림** (Growth Hacking P4)
   - 매일 1개 curated agenda 푸시
   - "오늘의 검증 질문"

6. **Challenge a Friend** (Growth Hacking P3)
   - 1:1 의견 대결 바이럴 루프

---

## Part 9: 최종 KPI 대시보드 및 보너스 계산

### 9.1 KPI 대시보드 (실제 구현 예시)

```typescript
// src/app/admin/kpi/dashboard.tsx
export default function KPIDashboard() {
  const { data: kpis } = useSWR('/api/admin/kpis', fetcher);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Primary KPI - B2B API */}
      <KPICard
        title="MRR (Monthly Recurring Revenue)"
        current={kpis.mrr}
        target={10000}
        unit="USD"
        progress={(kpis.mrr / 10000) * 100}
        bonus={calculateBonus(kpis.mrr, 10000, [
          { threshold: 5000, multiplier: 0.5 },
          { threshold: 10000, multiplier: 1.0 },
          { threshold: 15000, multiplier: 1.5 }
        ])}
        trend={kpis.mrr_trend}
      />

      <KPICard
        title="Active API Customers"
        current={kpis.api_customers}
        target={100}
        unit="customers"
        progress={(kpis.api_customers / 100) * 100}
        bonus={calculateBonus(kpis.api_customers, 100, [
          { threshold: 50, multiplier: 0.5 },
          { threshold: 100, multiplier: 1.0 },
          { threshold: 150, multiplier: 1.5 }
        ])}
      />

      <KPICard
        title="API Call Volume"
        current={kpis.api_calls}
        target={1000000}
        unit="calls/mo"
        progress={(kpis.api_calls / 1000000) * 100}
      />

      {/* Primary KPI - B2C Platform */}
      <KPICard
        title="MAU (Monthly Active Users)"
        current={kpis.mau}
        target={10000}
        unit="users"
        progress={(kpis.mau / 10000) * 100}
        bonus={calculateBonus(kpis.mau, 10000, [
          { threshold: 5000, multiplier: 0.5 },
          { threshold: 10000, multiplier: 1.0 },
          { threshold: 15000, multiplier: 1.5 }
        ])}
      />

      <KPICard
        title="Concluded Agendas"
        current={kpis.concluded_agendas}
        target={500}
        unit="agendas"
        progress={(kpis.concluded_agendas / 500) * 100}
      />

      <KPICard
        title="TKG Sync Rate"
        current={kpis.tkg_sync_rate}
        target={95}
        unit="%"
        progress={kpis.tkg_sync_rate}
        bonus={calculateBonus(kpis.tkg_sync_rate, 95, [
          { threshold: 85, multiplier: 0.5 },
          { threshold: 95, multiplier: 1.0 },
          { threshold: 99, multiplier: 1.5 }
        ])}
      />
    </div>
  );
}

function calculateBonus(
  current: number,
  target: number,
  thresholds: { threshold: number; multiplier: number }[]
): number {
  const bonusPool = 20000;  // $20K per quarter (예시)

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (current >= thresholds[i].threshold) {
      return bonusPool * thresholds[i].multiplier;
    }
  }

  return 0;
}
```

### 9.2 보너스 지급 시나리오 (구체 예시)

#### 시나리오 1: 목표 100% 달성

```
6개월 후:
- MRR: $10,000 (목표 달성) → Bonus Multiplier 1.0
- API Customers: 100개 (목표 달성) → Bonus Multiplier 1.0
- MAU: 10,000 (목표 달성) → Bonus Multiplier 1.0

Total Revenue (6개월): $60,000
Bonus Pool: $60,000 × 20% = $12,000

팀 분배 (5명 팀 가정):
- 팀 공통 (50%): $6,000 → 각 $1,200
- 개인 기여도 (30%): $3,600 → 역할별 목표 달성 시
- CEO 재량 (20%): $2,400 → 특별 기여 인정

개인 보너스 예시:
- Backend Dev: $1,200 (공통) + $1,000 (API 안정성) + $400 (CEO) = $2,600
- Frontend Dev: $1,200 (공통) + $800 (MAU) + $400 (CEO) = $2,400
- Product Manager: $1,200 (공통) + $1,200 (MRR) + $600 (CEO) = $3,000
```

#### 시나리오 2: 목표 150% 초과 달성

```
6개월 후:
- MRR: $15,000 (목표 150%) → Bonus Multiplier 1.5
- API Customers: 150개 (목표 150%) → Bonus Multiplier 1.5

Bonus Pool: $90,000 × 20% × 1.5 = $27,000

개인 보너스 예시:
- Product Manager: $1,800 (공통) + $2,000 (MRR) + $1,000 (CEO) = $4,800
- Backend Dev: $1,800 (공통) + $1,700 (API) + $800 (CEO) = $4,300
```

---

## Part 10: 최종 권고 및 액션 아이템

### 10.1 핵심 메시지

> **"live-article을 복제하고, TKG를 추가하고, B2B API로 수익화하라"**

### 10.2 즉시 시작 (이번 주)

#### Day 1-2: 프로젝트 셋업
```bash
# 1. live-article 복제
cd /Users/randybaek/workspace/
cp -r live-article factagora-mvp

# 2. 브랜딩 변경
# - package.json name: "factagora"
# - README.md 수정
# - Logo, Favicon 교체

# 3. DB 스키마 수정
# - factblocks → agendas
# - TKG 필드 추가
```

#### Day 3-5: TKG 설계
- [ ] TKG 스키마 작성 (`docs/tkg-schema.md`)
- [ ] TKG Sync Service 설계
- [ ] TKG Query API 스펙 작성

#### Week 2: API Key + Stripe
- [ ] API Key 생성 시스템 구현
- [ ] Stripe 연동 (Starter/Pro/Enterprise Tier)
- [ ] Rate Limiting 구현

### 10.3 30일 마일스톤

| Week | Milestone | Success Metric |
|------|-----------|----------------|
| Week 2 | TKG 설계 완료 + API Key 시스템 | API Key 생성 가능 |
| Week 4 | Agenda + Vote MVP | 10개 Agenda 생성 + 50표 |
| Week 6 | TKG Sync + Public API | 5개 Agenda → TKG 동기화 |
| Week 8 | Alpha Launch | 10개 AI 개발자 API 사용 |
| Week 12 | Beta Launch | MRR $1,000 + 100 MAU |

### 10.4 Decision Tree

```
Q1: FastAPI를 지금 도입할까?
→ NO. Next.js API Routes로 시작.
→ TKG Query API가 복잡해지면 (3개월 후) FastAPI 추가 검토.

Q2: TimescaleDB를 지금 도입할까?
→ NO. PostgreSQL로 시작.
→ 2,000+ Agenda 시점에 TimescaleDB 검토.

Q3: B2C vs B2B 중 무엇에 집중할까?
→ B2B API 우선 (MRR 집중).
→ B2C는 TKG 데이터 품질 향상용 보조 역할.

Q4: 팀 KPI는 무엇으로 할까?
→ Phase 1 (0-6개월): MRR $10K
→ Phase 2 (6-12개월): MRR $10K + MAU 10K
```

---

## Appendix A: live-article → Factagora 마이그레이션 가이드

### A.1 도메인 매핑 테이블

| live-article | Factagora | 변경 사항 |
|--------------|-----------|-----------|
| FactBlock | Agenda | 이름 변경, 필드 추가 (vote_count, conclusion_score) |
| Collection | Agora | 이름 변경, 커뮤니티 개념 |
| Article | LiveArticle | 유지 (AI 자동 생성 기사) |
| Relationship | Relationship | 유지, 타입 확장 (temporal_before, causal) |
| User | User | 유지 |
| Organization | Organization | 유지 (B2B 고객용) |

### A.2 DB 마이그레이션 스크립트

```sql
-- Step 1: factblocks 테이블 복제 및 확장
CREATE TABLE agendas AS SELECT * FROM factblocks;

ALTER TABLE agendas
  ADD COLUMN agenda_type TEXT DEFAULT 'fact_verification',
  ADD COLUMN conclusion_label TEXT,
  ADD COLUMN conclusion_score DECIMAL(5,2),
  ADD COLUMN evidence_count INT DEFAULT 0,
  ADD COLUMN vote_count INT DEFAULT 0,
  ADD COLUMN lifecycle_status TEXT DEFAULT 'open',
  ADD COLUMN tkg_node_id UUID,
  ADD COLUMN tkg_sync_status TEXT DEFAULT 'pending',
  ADD COLUMN tkg_synced_at TIMESTAMPTZ;

-- Step 2: collections → agoras
CREATE TABLE agoras AS SELECT * FROM collections;

-- Step 3: TKG 테이블 생성
CREATE TABLE tkg_nodes (...);
CREATE TABLE tkg_relationships (...);
```

### A.3 코드 마이그레이션 체크리스트

- [ ] `src/types/factblock.ts` → `src/types/agenda.ts`
- [ ] `src/services/factblock.service.ts` → `src/services/agenda.service.ts`
- [ ] `src/app/factblocks/` → `src/app/agendas/`
- [ ] `src/components/FactBlockCard` → `src/components/AgendaCard`
- [ ] API Routes 경로 변경: `/api/factblocks` → `/api/agendas`
- [ ] i18n 메시지 키 변경: `factblock.*` → `agenda.*`

---

## Appendix B: TKG API 전체 스펙

### B.1 Endpoints

```
GET  /api/v1/tkg/facts              # 검증된 사실 검색
POST /api/v1/tkg/reasoning-chain    # 시간축 추론 체인
GET  /api/v1/tkg/node/:id           # 특정 노드 조회
GET  /api/v1/tkg/relationships      # 관계 조회
POST /api/v1/tkg/embed              # Embedding 검색
GET  /api/v1/tkg/stats              # TKG 통계
```

### B.2 Rate Limits

| Tier | Rate Limit | Burst |
|------|------------|-------|
| Free | 100 req/day | 10 req/min |
| Starter | 10K req/day | 100 req/min |
| Pro | 100K req/day | 1K req/min |
| Enterprise | Unlimited | Custom |

### B.3 Response Format

```json
{
  "data": [...],
  "meta": {
    "query_time_ms": 42,
    "total_results": 127,
    "page": 1,
    "per_page": 10
  },
  "usage": {
    "requests_today": 23,
    "limit": 10000,
    "reset_at": "2026-02-08T00:00:00Z"
  }
}
```

---

**End of Document**

다음 단계: `/Users/randybaek/workspace/factagora-mvp/` 프로젝트 생성 및 개발 시작.
