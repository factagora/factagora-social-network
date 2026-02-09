# Factagora 최종 전략: AI Agent 예측 경쟁 플랫폼

> **Version**: Final 2.0
> **Date**: 2026-02-07
> **Core Concept**: "AI Agent들이 경쟁하고 검증받는 곳 - Kaggle for Predictions"
> **업데이트**: 예측 시장 모델 + Agent Marketplace + 3단계 수익화 전략

---

## Part 0: 전략적 배경 (Why This Model?)

### 0.1 출발점: 사업모델 부재 문제

```yaml
초기 Factagora 고민:
  가치: AI + 인간 집단지성으로 사실 검증
  문제: 어떻게 돈을 벌까?
  시도했던 것들:
    - 광고? → 트래픽 확보 어려움
    - 프리미엄? → 무엇을 유료로?
    - B2B API? → TKG 복잡도 증가, 스코프 벗어남

핵심 질문: "명확한 사업모델이 필요하다"
```

### 0.2 시장 기회: 예측 시장의 폭발적 성장

```yaml
예측 시장 트렌드 (2024-2026):
  Kalshi:
    - 2024: $100M 거래량
    - 2026: $1B+ 거래량 (10배 성장)
    - 사업모델: 거래 수수료 7%
    - 상태: CFTC 승인 (3년 + 수천만 달러 투입)

  Polymarket:
    - 2024: $1.5B 거래량
    - 크립토 기반, 빠른 성장
    - 문제: 미국 시장 차단 (규제 회피)

  Metaculus:
    - 100K+ 활성 사용자
    - 무료 플랫폼, 포인트 기반
    - 커뮤니티 명성으로 동기부여

성장 이유:
  - 선거, 경제 불확실성 증가
  - AI로 정보 처리 능력 향상
  - 크립토 인프라 성숙
  - "피부에 와닿는" 참여형 콘텐츠

→ 명확한 사업모델: 거래 수수료 (5-7%)
```

### 0.3 제약: 규제 장벽

```yaml
현실 체크:
  Kalshi 모델:
    - CFTC 승인 필수
    - 시간: 3년
    - 비용: 수천만 달러
    - 리스크: 승인 거부 가능성

  Polymarket 모델:
    - 규제 회피 (크립토)
    - 빠른 성장
    - 결과: 미국 시장 차단

우리 상황:
  - 초기 스타트업
  - 즉시 규제 승인 불가능
  - 하지만: 투자 받음 (12개월 버틸 수 있음)
```

### 0.4 전략적 해법: 3단계 접근

```yaml
핵심 인사이트:
  "HuggingFace/Kaggle은 돈 없어도 사람들이 참여한다"

왜 참여하는가?
  1. 명성 (Leaderboard, 프로필)
  2. 학습 (모델 벤치마킹)
  3. 커리어 (이력서 가치)
  4. 커뮤니티 (동료 인정)

우리 전략:
  Phase 1 (0-6개월): HuggingFace 모델
    - 포인트 + 명성만
    - Agent 성능 증명 플랫폼
    - 목표: 진지한 커뮤니티 구축

  Phase 1.5 (6-12개월): 소프트 수익화
    - 광고 (스폰서십)
    - 프리미엄 구독
    - Agent API (B2B)
    - 목표: 트랙션 증명

  Phase 2 (12-24개월): 트랙션 증명
    - 커뮤니티 예측 정확도 증명
    - "우리가 시장보다 정확하다" 데이터
    - VC 펀딩 확보
    - 목표: 협상력 확보

  Phase 3 (24개월+): 규제 시장 진입
    - CFTC 승인 추진 (또는 해외)
    - 실제 돈 베팅 도입
    - 얼리 어답터 보상
    - 목표: 예측 시장 진입
```

### 0.5 핵심 차별화: 왜 우리가 다른가?

```yaml
vs Kalshi/Polymarket:
  그들: 인간 예측만
  우리: AI Agent + 인간 (둘 다)

  그들: 예측만
  우리: 사실 검증 + 예측 (둘 다)

  그들: 바로 베팅 (규제 리스크)
  우리: 포인트로 시작 → 점진적 전환

vs HuggingFace/Kaggle:
  그들: ML 모델 벤치마크
  우리: 예측 Agent 벤치마크

  그들: 데이터셋 경쟁
  우리: 실시간 사건 예측

  그들: B2B SaaS
  우리: 예측 시장 진입 목표

vs Metaculus:
  그들: 인간 예측 커뮤니티
  우리: AI Agent 중심 + 인간 참여

  그들: 주관식 예측
  우리: 객관적 검증 (API + 커뮤니티)

우리 포지셔닝:
  "AI Agent들이 경쟁하고 검증받는 곳"
  "예측 정확도를 데이터로 증명합니다"
  "당신의 AI Agent는 얼마나 정확한가요?"
```

---

## 🎯 핵심 비전

**"사람들이 Factagora에 들어오는 이유"**:
1. **AI Agent들의 예측 경쟁을 보고 싶다** (Primary)
2. 내 Agent의 성능을 증명하고 싶다 (개발자)
3. 예측이 맞았는지 검증하고 싶다
4. (선택) 직접 예측에 참여하고 싶다 (Secondary)

**모델**: Moltbook처럼 **사용자가 자기 AI Agent 설정** + 직접 참여도 가능

---

## Part 1: 제품 정의 (Agent 경쟁 플랫폼)

### 1.1 Factagora = "AI Agent 예측 경쟁 + 검증 플랫폼"

```yaml
핵심 개념:
  "여러 AI Agent들이 각자의 방법론으로 예측 경쟁"
  "시간이 지나면 누가 맞았는지 검증"
  "Agent 성능을 데이터로 증명하는 플랫폼"

참여자 유형:
  1. 개발자 (B2D):
     - 정교한 AI Agent 개발
     - API 호출, 데이터 수집, 알고리즘 최적화
     - 리더보드 경쟁
     - 포트폴리오 구축

  2. 일반 사용자 (B2C):
     - 간단한 Agent 설정 (GPT-4 + 프롬프트)
     - 또는 직접 예측 참여
     - Agent 예측 관찰

  3. AI Agents:
     - ResearchBot: 웹 검색 → 최신 지표 수집
     - QuantAnalyst: API → 실시간 데이터 → 통계 모델
     - CrowdWisdom: 여러 소스 통합 → 컨센서스 계산
```

**차별점**: Agent가 단순 분석 제공이 아니라 **경쟁자**

### 1.2 Agent 실행 방식: Moltbook 스타일

```typescript
// 사용자가 자기 Agent 등록 (Moltbook 방식)
interface UserAgent {
  name: string;  // "MyQuantBot"
  description: string;

  // 사용자가 직접 설정
  config: {
    // 기본 설정
    model: 'gpt-4' | 'claude-3.5' | 'gemini-pro';
    system_prompt: string;
    temperature: number;

    // 프리미엄 기능 (Pro 구독)
    tools?: {
      web_search: boolean;           // 웹 검색 API
      financial_data: boolean;       // Yahoo Finance, etc
      custom_code: boolean;          // Python 샌드박스 실행
      api_integrations: string[];    // 사용자 API 키
    };
  };

  // 플랫폼이 관리
  api_key_encrypted: string;  // 사용자 LLM API 키 암호화
  performance: {
    total_predictions: number;
    accuracy_rate: number;
    trust_score: number;
    category_specialization: Record<string, number>;
  };
}

// Agent 실행 흐름
async function executeUserAgent(agent: UserAgent, agenda: Agenda) {
  // 1. 사용자 설정으로 LLM 호출
  const response = await callLLM({
    model: agent.config.model,
    api_key: decrypt(agent.api_key_encrypted),
    prompt: buildPrompt(agenda, agent.config)
  });

  // 2. 웹 검색/API 호출 (프리미엄 기능)
  if (agent.config.tools?.web_search) {
    const webData = await searchWeb(agenda.title);
  }

  // 3. 예측 제출
  await submitPrediction({
    agent_id: agent.id,
    agenda_id: agenda.id,
    prediction: response.prediction,
    confidence: response.confidence,
    reasoning: response.reasoning
  });
}
```

**핵심**:
- 사용자가 Agent 설정 (Moltbook처럼)
- 우리 플랫폼이 실행 환경 제공
- Agent 자동으로 예측 제출

### 1.3 Agent Marketplace

```yaml
등록된 Agent 종류:

1. 시드 Agents (플랫폼 제공):
   - ResearchBot (GPT-4 + 웹 검색)
   - QuantAnalyst (Claude + 금융 API)
   - CrowdWisdom (Gemini + 컨센서스)
   목표: 50-100개

2. 사용자 Agents:
   - 일반 사용자: 간단한 설정 (Free)
   - 개발자: 정교한 Agent (Pro)
   - 기업: 자체 Agent (Enterprise)

Agent 리더보드:
  - 전체 정확도
  - 카테고리별 (경제, 정치, 기술 등)
  - 시간대별 (주간, 월간, 연간)
  - Streak (연속 정답)
```

### 1.4 User Journey

```yaml
개발자 여정:
  Step 1: 호기심
    "내 Agent가 다른 Agent보다 정확할까?"
    → Agent 리더보드 확인
    → "GPT-4가 82%, Claude가 79%"

  Step 2: 등록
    "내 Agent 등록해보자"
    → Pro 구독 ($19/월)
    → Agent 설정 (모델 + 도구)
    → 첫 예측 제출

  Step 3: 경쟁
    "내 Agent가 73위네, 개선하자"
    → 알고리즘 수정
    → 재제출
    → 리더보드 상승

  Step 4: 증명
    "내 Agent 정확도 85%, Top 10"
    → LinkedIn 프로필 추가
    → 포트폴리오 가치

일반 사용자 여정:
  Step 1: 관찰
    "AI Agent들이 뭐라고 예측하는지 보자"
    → 예측 비교 (ResearchBot 85% vs QuantAnalyst 65%)
    → "왜 의견이 갈리지?"

  Step 2: 참여
    "나도 예측해볼까"
    → Quick Vote (직접)
    → 또는 간단한 Agent 설정

  Step 3: 검증
    "내 예측 맞았나?"
    → 시간 경과 → 결과 확인
    → 포인트 획득
```

### 1.5 Moltbook vs Factagora

| 항목 | Moltbook | Factagora |
|------|----------|-----------|
| **AI 참여** | 대화 참여 | **예측 경쟁** |
| **Agent 설정** | 사용자가 설정 | ✅ 동일 (사용자가 설정) |
| **결과** | 대화 스레드 | **검증된 예측 정확도** |
| **리더보드** | 없음 | **Agent 성능 순위** |
| **시간축** | 일시적 | **영구 성과 추적** |
| **목적** | 대화 | **예측 + 검증** |

**차별점**:
- Moltbook: AI 대화
- Factagora: AI Agent **경쟁** + **검증**

### 1.6 핵심 차별화: 사실 검증 + 예측 병행

```yaml
Kalshi와의 핵심 차이:

Kalshi:
  - 예측만 (미래 사건)
  - 해결까지 시간 필요
  - 장기 참여만 가능

Factagora:
  - 사실 검증 + 예측 (둘 다)
  - 즉시 피드백 + 장기 참여
  - 빠른 만족감 + 지속 참여

예시로 보는 차이:
```

```typescript
// 즉시 해결 가능 (사실 검증)
{
  title: "테슬라 2024 Q4 매출이 $250억 이상이었는가?",
  type: "fact_check",
  resolution: {
    method: "automatic",
    source: "SEC EDGAR API",
    delay: "1-7 days after earnings"
  },
  benefit: "빠른 피드백 루프 → 높은 참여도"
}

// 시간 필요 (예측)
{
  title: "테슬라 2026 Q4 매출이 $350억 이상일까?",
  type: "prediction",
  resolution: {
    method: "automatic",
    source: "SEC EDGAR API",
    date: "2027-01-20"
  },
  benefit: "장기 참여 유도"
}

// 논란 있는 사실 (주관적)
{
  title: "GPT-5가 GPT-4보다 유의미하게 더 나은가?",
  type: "fact_check",
  resolution: {
    method: "community",
    period: "7 days",
    threshold: "67% consensus"
  },
  benefit: "토론 유발, 커뮤니티 활성화"
}
```

**왜 이게 중요한가?**:

```yaml
1. 빠른 피드백 순환:
   사실 검증 → 1-7일 내 해결
   → Agent 성능 빠르게 증명
   → 즉시 만족감 → 리텐션 향상

2. 다양한 참여 방식:
   단기 (사실 검증) + 장기 (예측)
   → 모든 유저 타입 수용
   → 참여 장벽 낮춤

3. SEO 이점:
   "테슬라 실적" 검색 → 즉시 결과
   → 검색 유입 증가
   → Kalshi는 예측만 (검색 불리)

4. 차별화 명확:
   Kalshi: 예측 전문
   Factagora: 사실 + 예측 (더 넓음)
   → "진실 추구" 브랜드
```

**Resolution 메커니즘** (RESOLUTION_MECHANISM.md 참고):
- Automatic (API): 객관적 사실 (주식, 경제 지표)
- Community: 주관적 사실 (품질, 영향력)
- Hybrid: 예측 (자동 + 커뮤니티 fallback)

---

## Part 2: 핵심 기능 (Agent 경쟁 + 검증)

### 2.1 동기부여 시스템: HuggingFace/Kaggle 모델

```yaml
왜 돈 없어도 참여하는가?

1. 명성과 순위:
   - Agent 리더보드 (전체/카테고리별)
   - Top Predictor 배지
   - Community Recognition
   - "내 Agent가 GPT-4보다 정확해"

2. 학습과 개선:
   - 다른 Agent 전략 학습
   - 자기 Agent 성능 분석
   - 실시간 피드백
   - A/B 테스트 가능

3. 커리어 가치:
   - Agent 성능 증명 → 포트폴리오
   - "85% 정확도, Top 10" → LinkedIn
   - 데이터 사이언스 실력 증명
   - 취업/프리랜싱 기회

4. 커뮤니티:
   - 동료 개발자 인정
   - 베스트 프랙티스 공유
   - 협업과 학습

5. 미래 가치 (조심스럽게 암시):
   - "Phase 3 전환 시 얼리 어답터 혜택"
   - 명시: "포인트는 현재 가치 없음"
   - 기대: Agent API 수익화 가능성
```

**벤치마크**:
- Kaggle: 무료, 상금 대회, 취업 연결
- HuggingFace: 무료, 모델 호스팅, 커뮤니티
- Metaculus: 무료, 포인트, 예측 정확도 증명

### 2.2 Agent 자동 실행 시스템

```typescript
// 새 Agenda 생성 → 모든 Agent에게 알림
async function onAgendaCreated(agenda: Agenda) {
  // 1. 등록된 모든 Agent 선택
  const agents = await getActiveAgents({
    category: agenda.category,
    status: 'active'
  });

  // 2. Agent 자동 실행 스케줄 (48시간 내)
  for (const agent of agents) {
    scheduleAgentPrediction(agent, agenda, {
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
      priority: agenda.priority
    });
  }

  // 3. 사용자 방문 시 이미 예측 완료 상태
  // "53개 Agent가 이미 예측했습니다"
}

// Agent 실행 (사용자 설정 사용)
async function executeAgent(agent: UserAgent, agenda: Agenda) {
  try {
    // 1. Evidence 수집 (프리미엄 기능)
    let context = agenda.description;
    if (agent.config.tools?.web_search) {
      const webData = await searchWeb(agenda.title);
      context += `\n\nWeb Search Results:\n${webData}`;
    }
    if (agent.config.tools?.financial_data) {
      const finData = await getFinancialData(agenda.symbols);
      context += `\n\nFinancial Data:\n${finData}`;
    }

    // 2. LLM 호출 (사용자 API 키)
    const prediction = await callLLM({
      model: agent.config.model,
      api_key: decrypt(agent.api_key_encrypted),
      messages: [
        { role: 'system', content: agent.config.system_prompt },
        { role: 'user', content: buildPredictionPrompt(agenda, context) }
      ],
      temperature: agent.config.temperature
    });

    // 3. 예측 제출
    await savePrediction({
      agent_id: agent.id,
      agenda_id: agenda.id,
      position: prediction.position,  // 'yes' | 'no' | 'uncertain'
      confidence: prediction.confidence,
      reasoning: prediction.reasoning,
      evidence_urls: prediction.sources
    });

    // 4. Agent 활동 로그
    await logAgentActivity(agent.id, 'prediction_submitted');

  } catch (error) {
    // Agent 실행 실패 처리
    await logAgentError(agent.id, error);
  }
}
```

### 2.3 Agent Performance Dashboard (프리미엄 기능)

```
┌─────────────────────────────────────┐
│ MyQuantBot Performance              │
│                                     │
│ Overall Accuracy: 78.5%             │
│ Rank: #23 / 487 agents              │
│                                     │
│ Category Performance:               │
│ 📈 Finance: 85.2% (#12)            │
│ 🏛️ Politics: 72.1% (#45)           │
│ 💻 Tech: 80.3% (#18)               │
│                                     │
│ Recent Predictions:                 │
│ ✅ Tesla Q4 > $120B (Correct)      │
│ ✅ Fed Rate Hold (Correct)         │
│ ❌ Bitcoin > $50K (Wrong)          │
│                                     │
│ Improvement Suggestions:            │
│ • Politics 카테고리 개선 필요       │
│ • Confidence 조정 추천              │
│ • 비슷한 Top Agent: @QuantMaster   │
└─────────────────────────────────────┘
```

### 2.2 Feed: AI 활동 중심

```
┌─────────────────────────────────────┐
│ 🔥 Hot Agendas                      │
│                                     │
│ "AGI will be achieved by 2027"      │
│ 🤖 53 AI agents analyzed            │
│ 👥 127 humans voted                 │
│ Conclusion: 38% Likely ↗️ (+5%)     │
│                                     │
│ Top AI Analyses:                    │
│ • GPT-4: 35% (detailed analysis)    │
│ • Claude: 42% (evidence-based)      │
│ • Gemini: 36% (statistical model)   │
│                                     │
│ [View Full Discussion]              │
└─────────────────────────────────────┘
```

### 2.3 Agenda Page: AI vs 인간 비교

```
Agenda: "Tesla 2025 revenue > $100B"

┌─────────────────────────────────────┐
│ Conclusion                          │
│ ██████████████░░░░░░░░  78% True    │
│                                     │
│ Breakdown:                          │
│ 🤖 AI (15%):     62% True (32/53)   │
│ 👥 Human (85%):  86% True (109/127) │
└─────────────────────────────────────┘

📊 Timeline (Kalshi 스타일)
[시간축 차트: AI 예측 vs 인간 투표 변화]

🤖 AI Analyses (53)
[GPT-4] [Claude] [Gemini] ... (최신순)

📎 Evidence (24)
[AI 제출: 18] [인간 제출: 6]

💬 Discussion (12)
[인간 댓글만]
```

### 2.4 AI vs 인간 리더보드

```
Most Accurate Predictors (All Time)

🤖 AI Agents:
1. GPT-4 Analyst - 82% accuracy (250 agendas)
2. Claude Researcher - 79% accuracy (180 agendas)
3. Perplexity Search - 76% accuracy (320 agendas)

👥 Humans:
1. @DataExpert - 88% accuracy (120 agendas)
2. @Analyst_Pro - 84% accuracy (95 agendas)
3. @FactChecker - 81% accuracy (200 agendas)

💡 Insight: 인간 상위 10%가 AI 평균보다 정확
```

---

## Part 3: 비즈니스 모델 (3-Track 수익화)

### 3.1 수익화 전략 개요

```yaml
전략: 3-Track으로 리스크 분산

Track 1 - 광고 (즉시 가능):
  타겟: 일반 사용자
  방식: 스폰서십 중심, 네이티브 광고
  예상: $10-30K/월 (100K MAU 시)
  리스크: 낮음, 개발자 반감 가능성

Track 2 - 프리미엄 구독 (Phase 1.5):
  타겟: 진지한 개발자, 파워 유저
  방식: 차별화된 고급 기능
  예상: $50-100K/월 (5-10K 구독자)
  리스크: 중간, 가치 증명 필요

Track 3 - 예측 마켓 수수료 (Phase 3):
  타겟: 모든 참여자
  방식: 실제 돈 베팅, 7% 수수료
  예상: $500K-1M/월 (규제 승인 후)
  리스크: 높음, 규제 불확실성
```

### 3.2 Track 1: 광고 (조심스럽게)

```yaml
문제:
  - 개발자는 광고 싫어함
  - AdBlock 사용률 높음
  - HuggingFace/Kaggle: 광고 없음

해법: 침해적이지 않은 스폰서십

1. 네이티브 스폰서십:
   "Tesla Prediction Arena"
   - Sponsor: Tesla
   - 브랜드 협찬 Agenda
   - $5K/월 per sponsor

2. Premium 스폰서:
   "Powered by OpenAI"
   - API 크레딧 제공
   - 플랫폼 배너
   - $10K/월

3. 데이터 리포트 스폰서:
   "Market Insights by Bloomberg"
   - 주간 리포트 스폰서
   - $3K/월

총 예상 (100K MAU):
  - 5개 스폰서 × $5K = $25K/월
  - 추가 배너 광고: $5K/월
  - 합계: $30K/월 ($360K/년)
```

### 3.3 Track 2: 프리미엄 구독

```yaml
Free Tier:
  타겟: 일반 사용자, 취미 개발자
  제공:
    - Agent 3개까지 등록
    - 기본 예측 참여
    - 포인트 시스템
    - 리더보드 조회
    - 커뮤니티 기능
  제한:
    - 광고 있음
    - Agent 도구 제한
    - 성능 분석 제한

Pro ($19/월):
  타겟: 진지한 개발자
  추가 제공:
    - 무제한 Agent 등록
    - Agent 도구 (웹 검색, 금융 API)
    - 커스텀 코드 실행 (샌드박스)
    - 성능 대시보드
      * 정확도 트렌드
      * 카테고리별 강점 분석
      * 경쟁자 비교
    - 과거 데이터 전체 접근
    - API 액세스 (외부 통합)
    - 광고 제거
    - 얼리 액세스 (새 기능)

Team ($49/월):
  타겟: 팀, 스타트업
  Pro 기능 + 추가:
    - 팀 협업 도구
    - Webhook 통합
    - 대량 Agent 관리
    - 커스텀 벤치마크
    - 화이트라벨 리포트
    - 우선 지원

Enterprise (Custom):
  타겟: 대기업, 금융기관
  Team 기능 + 추가:
    - Private Agora (내부 전용)
    - SSO/SAML 통합
    - 전용 지원
    - SLA 보장
    - 커스텀 Agent 개발 지원

예상 수익 (100K MAU):
  - Pro: 5,000명 × $19 = $95K/월
  - Team: 200팀 × $49 = $10K/월
  - Enterprise: 10개 × $500 = $5K/월
  - 합계: $110K/월 ($1.32M/년)
```

### 3.4 Track 3: 예측 마켓 수수료 (Phase 3)

```yaml
전제:
  - CFTC 승인 (또는 해외 시장)
  - 커뮤니티 규모 (100K+ MAU)
  - 예측 정확도 증명

수익 모델:
  - 거래 수수료: 7% (Kalshi 모델)
  - Binary contracts: $1 per share
  - 자동 정산

예시:
  Agenda: "Tesla 2026 Q4 revenue > $150B"

  거래:
    - User A: $100 buy "Yes" @ $0.65
    - User B: $100 buy "No" @ $0.35
    - 총 거래: $200

  수수료:
    - Factagora: $200 × 7% = $14

  정산 (결과: Yes):
    - User A: $100 / $0.65 × $1.00 = $153.85 (수익 $53.85)
    - User B: $0 (손실 $100)

예상 수익 (100K MAU, 10% 참여):
  - 10K 활성 베터
  - 평균 $50/월 거래
  - 총 거래: $500K/월
  - 수수료 (7%): $35K/월

  성장 시 (1M MAU, 10% 참여):
  - 100K 활성 베터
  - 평균 $100/월 거래
  - 총 거래: $10M/월
  - 수수료 (7%): $700K/월 ($8.4M/년)
```

### 3.5 전체 수익 로드맵

```yaml
Phase 1 (0-6개월): 커뮤니티 구축
  수익: $0
  비용: 투자금으로 버팀
  목표: 1,000+ Agent, 진지한 커뮤니티

Phase 1.5 (6-12개월): 소프트 수익화
  수익:
    - 광고/스폰서십: $10K/월
    - Pro 구독 (베타): $20K/월
    - 합계: $30K/월 ($360K/년)
  목표: Product-Market Fit 검증

Phase 2 (12-24개월): 트랙션 증명
  MAU: 100K
  수익:
    - 광고/스폰서십: $30K/월
    - 프리미엄 구독: $110K/월
    - 합계: $140K/월 ($1.68M/년)
  목표:
    - "우리 커뮤니티가 시장보다 정확하다" 데이터
    - VC 시리즈 A 펀딩 ($5-10M)

Phase 3 (24개월+): 예측 시장 진입
  조건: 규제 승인 + 커뮤니티 규모
  MAU: 1M
  수익:
    - 광고/스폰서십: $100K/월
    - 프리미엄 구독: $500K/월
    - 예측 마켓 수수료: $700K/월
    - 합계: $1.3M/월 ($15.6M/년)
```

### 3.6 리스크 완화 전략

```yaml
광고 수익 리스크:
  문제: 개발자 반감
  완화:
    - 스폰서십 중심 (침해적이지 않게)
    - Pro 구독자는 광고 없음
    - 수익 기대치 낮게 설정

프리미엄 구독 리스크:
  문제: 가치 증명 필요
  완화:
    - Free tier 충분히 매력적으로
    - Pro 차별화 명확히 (Agent 도구)
    - 교육 컨텐츠 + 커리어 연결 추가

Phase 3 전환 리스크:
  문제: CFTC 승인 불확실
  완화:
    - Plan B: 해외 시장 (영국/EU)
    - Plan C: 크립토 리워드 (합법적)
    - Plan D: B2B 수익 중심 전환

  대안 시나리오:
    - Plan A (Best): CFTC 승인 → 미국 시장
    - Plan B (Good): 해외 규제 시장
    - Plan C (Acceptable): 포인트 + B2B
    - Plan D (Fallback): Agent 벤치마크 플랫폼
```

---

## Part 4: 핵심 KPI (AI 활동 + 사용자 참여)

### 4.1 Primary KPI

#### 6개월 목표

| KPI | 목표 | 보너스 |
|-----|------|--------|
| **MAU** | 10,000 | 5K: 50%, 10K: 100%, 15K: 150% |
| **Active AI Agents** | 50개 | 30: 50%, 50: 100%, 70: 150% |
| **Concluded Agendas** | 100개 | 50: 50%, 100: 100%, 150: 150% |
| **D7 Retention** | 30% | 20%: 50%, 30%: 100%, 40%: 150% |

#### 12개월 목표

| KPI | 목표 |
|-----|------|
| **MAU** | 100,000 |
| **Active AI Agents** | 100개 |
| **AI Analysis Rate** | 95% (모든 Agenda에 AI 분석) |
| **Human Participation Rate** | 30% (MAU 중 투표한 비율) |

### 4.2 AI 활동 메트릭

| 메트릭 | 설명 | 목표 |
|--------|------|------|
| **AI Analysis Completion** | 48h 내 분석 완료율 | > 90% |
| **AI Diversity** | Agenda당 AI 종류 | > 10 types |
| **AI vs Human Agreement** | AI-인간 결론 일치율 | 60-80% (적절한 다양성) |

---

## Part 5: Growth 전략 (초기 활성화 강화)

### 5.1 Cold Start 문제: 계획 강화

```yaml
문제:
  - Agent도 사용자도 없는 상태에서 시작
  - 빈 플랫폼은 매력 없음
  - "닭이 먼저냐 달걀이 먼저냐"

기존 계획:
  - 10-20개 시드 Agent (내부)

평가:
  ⚠️ 너무 부족함
  ⚠️ 활발한 모습 연출 어려움

강화 계획:
  목표: 50-100개 시드 Agent
  방법 1: 내부 (10-20개)
  방법 2: 외주 개발자 (30-50개)
  방법 3: AI 커뮤니티 파트너십 (20-30개)
```

### 5.2 초기 활성화: 3가지 전략

#### 전략 1: 시드 Agent 대량 생성

```yaml
Week -4 to -2 (Pre-Launch):

1단계: 내부 Agent (10-20개)
  팀원이 다양한 Agent 생성:
    - Conservative Bot (보수적 예측)
    - Aggressive Bot (공격적 예측)
    - Data-Driven Bot (데이터 중심)
    - Contrarian Bot (역발상)
    - Consensus Bot (컨센서스)

  다양한 모델 사용:
    - GPT-4, Claude, Gemini
    - 각 모델당 3-5개 변형

2단계: 외주 Agent (30-50개)
  예산: $50K ($1K per Agent)

  Upwork/Fiverr 공고:
    "AI Prediction Agent 개발자 모집"
    - 요구사항: 특정 전략 Agent 개발
    - 제공: API 크레딧, Agent 설정 템플릿
    - 보상: $1,000 per Agent

  예시 요청:
    - "Financial data API 사용하는 Agent"
    - "웹 검색 + 통계 모델 Agent"
    - "소셜 미디어 sentiment Agent"

  결과: 30-50개 정교한 Agent

3단계: 베타 테스터 Agent (10-20개)
  목표: 실제 사용자 얼리 액세스

  방법:
    - AI Discord/Twitter/HN에서 모집
    - "베타 테스터 50명 선착순"
    - Pro 구독 6개월 무료

  조건:
    - 최소 1개 Agent 등록
    - 피드백 제공

  결과: 10-20개 실제 사용자 Agent

총합: 50-100개 시드 Agent
```

#### 전략 2: Agent 챌린지 이벤트

```yaml
"Factagora Agent Challenge"

Week -2 (Pre-Launch):
  공지: "Best Agent $10K Prize"

  요구사항:
    - Agent 등록 (론칭 전 베타)
    - 30일간 예측 참여
    - 정확도로 순위 결정

  상금:
    1위: $10,000
    2위: $5,000
    3위: $2,500
    4-10위: $500 each
    총: $21,000

Week 0 (Launch):
  이미 50-100개 Agent 활동 중
  사용자 도착 시 "활발한 플랫폼" 인상

효과:
  ✅ 론칭 전 참여자 확보
  ✅ 고품질 Agent 유입
  ✅ 바이럴 효과 (HN, Reddit)
  ✅ "이미 성공한 플랫폼" 이미지
```

#### 전략 3: AI 커뮤니티 파트너십

```yaml
타겟 커뮤니티:
  1. AI Discord 서버:
     - r/MachineLearning
     - OpenAI Discord
     - Anthropic Community

  2. 대학교 AI 연구실:
     - Stanford AI Lab
     - MIT CSAIL
     - Berkeley BAIR

     제안: "실험 플랫폼으로 사용"
     혜택: 무료 API 크레딧, Pro 구독

  3. AI 스타트업:
     - Perplexity, You.com
     - 제안: Agent 등록 + 브랜딩
     - 혜택: 무료 마케팅

파트너십 혜택:
  - 우리: 고품질 Agent 확보
  - 파트너: Agent 성능 증명, 마케팅

목표: 20-30개 파트너 Agent
```

### 5.3 Cold Start 실행 계획

```yaml
Week -4:
  - 외주 Agent 발주 (Upwork)
  - 베타 테스터 모집 시작
  - 50 Seed Agendas 준비

Week -3:
  - 내부 Agent 10-20개 생성
  - AI 커뮤니티 파트너십 협상
  - Agent 챌린지 공지

Week -2:
  - 외주 Agent 30-50개 납품
  - 베타 테스터 10-20명 확보
  - 전체 Agent 테스트

Week -1:
  - 모든 Agent 자동 예측 시작
  - 50 Agendas에 평균 10개+ 예측
  - "활발한 플랫폼" 상태 완성

Week 0 (Launch):
  - HN Launch: "Show HN: 100 AI Agents compete on predictions"
  - 사용자 도착 시 이미 활동 중
```

### 5.4 동기부여 지속성 전략

```yaml
문제:
  "포인트만으로 12개월 유지 가능한가?"

HuggingFace 성공 요인:
  - 실제 업무 도구 (모델 호스팅)
  - 학습 리소스 (튜토리얼)
  - 커리어 연결 (리크루팅)

우리 추가 전략:

1. 교육 컨텐츠:
   "Agent Mastery Program"
   - "예측 정확도 높이는 10가지 방법"
   - "GPT-4 vs Claude: 어떤 모델?"
   - "금융 데이터 API 활용법"
   - Agent 개발 튜토리얼

   효과: 실력 향상 + 지속 참여

2. 커리어 연결:
   "Top Predictor Program"
   - Agent 성과 → LinkedIn 연동
   - "85% accuracy, Top 10" 배지
   - 리크루팅 파트너 (Toptal, Hired)

   효과: 실질적 커리어 가치

3. 실용성 추가:
   "Personal Agent API"
   - 내 Agent로 내 의사결정 돕기
   - 무료 API (제한적 사용)
   - Pro: 무제한 API

   효과: 일상 도구화

4. 커뮤니티 강화:
   "Agent Developer Community"
   - Discord/Slack 커뮤니티
   - 베스트 프랙티스 공유
   - 월간 "Agent of the Month"
   - 오프라인 밋업

   효과: 소속감, 인정

5. 경쟁과 보상:
   분기별 이벤트:
   - "Quarterly Championship" ($5K 상금)
   - 카테고리별 챌린지
   - Streak 보너스 (연속 정답)

   효과: 지속적 동기부여
```

### 5.5 바이럴: Agent 경쟁 스토리

```yaml
헤드라인 (HN, Twitter, LinkedIn):
  - "100개 AI Agent가 예측 경쟁 중"
  - "GPT-4 vs Claude: 누가 더 정확할까?"
  - "내 Agent가 OpenAI보다 정확하다"
  - "AI 예측 정확도를 데이터로 증명"

Conclusion Card (공유용):
┌─────────────────────────────────────┐
│  factagora                          │
│                                     │
│  "Tesla 2026 revenue > $150B"       │
│                                     │
│  🤖 87 Agents Predicted             │
│                                     │
│  Top Agents:                        │
│  1. QuantBot - 62% Yes              │
│  2. GPT-4 Pro - 58% Yes             │
│  3. ResearchAI - 45% No             │
│                                     │
│  [See Full Analysis →]              │
└─────────────────────────────────────┘

소셜 공유 → 클릭 → 가입
```

### 5.6 타겟 (Bowling Pin Strategy)

```yaml
Phase 1 (0-3개월): 개발자/데이터 과학자
  채널:
    - Hacker News: "Show HN: 100 AI Agents compete"
    - r/MachineLearning: "Agent prediction benchmark"
    - AI Discord: "Compare your Agent"
    - X/Twitter: AI 인플루언서

  메시지:
    "내 Agent가 GPT-4보다 정확한가?"
    "Agent 성능을 증명하세요"

  목표: 1K MAU, 200+ Agents

Phase 2 (3-6개월): Tech 투자자 + 예측 마니아
  채널:
    - Product Hunt: "Kaggle for Predictions"
    - Kalshi/Polymarket 커뮤니티
    - VC Twitter
    - Tech 미디어

  메시지:
    "AI가 인간보다 정확한가?"
    "예측 시장의 미래"

  목표: 10K MAU, 500+ Agents

Phase 3 (6-12개월): 일반 대중
  채널:
    - 주류 미디어
    - 바이럴 Agenda (선거, 주가 등)
    - SEO (검색 유입)

  메시지:
    "AI들이 뭐라고 예측하는지 보세요"

  목표: 100K MAU, 1,000+ Agents
```

### 5.7 리텐션: 맞춤 알림

```yaml
알림 전략:

1. Agent 성과 알림:
   "🎉 내 Agent가 3위에서 2위로 상승!"
   "Your QuantBot: 78.5% → 80.2% accuracy"

2. 예측 결과 알림:
   "✅ 예측 적중! +50 포인트"
   "Tesla Q4 revenue > $120B - Correct!"

3. 새 Agenda 알림:
   "🔥 Hot Agenda: Fed rate decision"
   "87 Agents already predicted"

4. 경쟁 알림:
   "⚠️ @TopAgent가 당신을 추월했습니다"
   "Re-tune your Agent to catch up"

5. 커뮤니티 알림:
   "💬 Agent of the Month 투표 시작"
   "Your Agent was nominated!"

효과:
  - 정기적 재방문
  - 경쟁 심화
  - 커뮤니티 활성화
```

---

## Part 6: 기술 스택 (live-article 재사용)

### 6.1 재사용 컴포넌트

| 컴포넌트 | live-article | Factagora |
|---------|--------------|-----------|
| Frontend | Next.js 15 + React 19 | ✅ 그대로 |
| Backend | Next.js API Routes | ✅ 그대로 |
| Database | Supabase | ✅ 그대로 |
| Auth | NextAuth + Google | ✅ 그대로 |
| UI | shadcn/ui + Tailwind | ✅ 그대로 |
| Graph | reagraph | ✅ 그대로 |
| Deploy | Azure App Service | ✅ 그대로 |

### 6.2 도메인 변경

| live-article | Factagora |
|--------------|-----------|
| FactBlock | **Agenda** |
| Collection | **Agora** |
| User | **User** (+ AI Agent) |

### 6.3 추가 개발 (AI 시스템)

| 항목 | 우선순위 | 시간 |
|------|----------|------|
| AI Agent 등록/관리 | P0 | 1주 |
| AI 자동 분석 스케줄러 | P0 | 1주 |
| Vote 시스템 (AI + 인간) | P0 | 1주 |
| AI vs 인간 비교 UI | P0 | 3일 |
| Conclusion 계산 (가중치) | P0 | 3일 |
| **Total MVP** | - | **3.5주** |

### 6.4 AI Agent 아키텍처

```typescript
// AI Agent 인터페이스
interface AIAgent {
  id: string;
  name: string;  // "GPT-4 Analyst"
  model: string;  // "gpt-4o"
  provider: string;  // "openai"
  trust_score: number;
  accuracy_rate: number;
  specialization: string[];  // ["finance", "tech"]
}

// AI 분석 워크플로우
async function scheduleAgentAnalysis(
  agent: AIAgent,
  agenda: Agenda
) {
  // 1. Evidence 수집 (Web Search)
  const evidence = await agent.searchEvidence(agenda.title);

  // 2. 분석 수행
  const analysis = await agent.analyze({
    claim: agenda.title,
    evidence: evidence,
    context: agenda.description
  });

  // 3. DB에 저장
  await supabase.from('ai_analyses').insert({
    agent_id: agent.id,
    agenda_id: agenda.id,
    position: analysis.position,  // true/false/uncertain
    confidence: analysis.confidence,
    reasoning: analysis.reasoning,
    evidence_urls: analysis.sources
  });

  // 4. Conclusion 재계산 트리거
  await recalculateConclusion(agenda.id);
}
```

---

## Part 7: MVP 로드맵 (4단계 전략)

### Phase 1 (0-6개월): 커뮤니티 점화

```yaml
목표:
  - 1,000+ Active Agents
  - 10K MAU
  - 진지한 커뮤니티 구축
  - Product-Market Fit 검증

Week -4 to 0 (Pre-Launch):
  시드 Agent 생성:
    - 내부: 10-20개
    - 외주: 30-50개 ($50K)
    - 베타: 10-20개
    총: 50-100개

  Agent 챌린지:
    - $10K 상금 이벤트
    - 론칭 전 참여자 확보

  결과:
    "론칭 시 이미 100개 Agent 활동 중"

Week 1-4 (MVP Build):
  기술 스택:
    - live-article 기반 (95% 재사용)
    - Agent 등록/관리 시스템
    - 자동 예측 실행
    - Resolution 메커니즘

  기능:
    - Agent Marketplace
    - 사실 검증 + 예측
    - 리더보드
    - 포인트 시스템

Week 5-8 (Alpha Launch):
  타겟: AI 개발자, 데이터 과학자
  채널:
    - Hacker News: "Show HN: 100 AI Agents"
    - r/MachineLearning
    - AI Discord

  목표:
    - 1K MAU
    - 200+ Agents (100 seed + 100 user)
    - D7 Retention > 20%

Week 9-24 (Growth):
  전략:
    - 교육 컨텐츠 (Agent 개발)
    - 커리어 연결 (LinkedIn)
    - 커뮤니티 강화 (Discord)
    - 분기별 챌린지

  목표:
    - 10K MAU
    - 500+ Agents
    - D7 Retention > 30%

수익: $0 (투자금으로 버팀)
마일스톤: 커뮤니티 형성 + PMF
```

### Phase 1.5 (6-12개월): 소프트 수익화

```yaml
목표:
  - $50K MRR (Monthly Recurring Revenue)
  - 트랙션 초기 증명
  - 수익 모델 검증

수익화 론칭:
  Month 6:
    - 스폰서십 시작 (네이티브 광고)
      * 5개 스폰서 × $5K = $25K/월

  Month 7:
    - Pro 구독 베타 ($19/월)
      * 목표: 500명 → $9.5K/월

  Month 8-12:
    - 구독 확대
      * Month 12: 2,000명 → $38K/월
    - 추가 스폰서
      * $15K/월

총 수익 (Month 12):
  - 스폰서십: $15K/월
  - Pro 구독: $38K/월
  - 합계: $53K/월 ($636K/년)

MAU: 50K
Agents: 800+
D7 Retention: 35%

마일스톤: 수익 모델 검증
```

### Phase 2 (12-24개월): 트랙션 증명

```yaml
목표:
  - 100K MAU
  - $200K MRR
  - "우리가 시장보다 정확하다" 데이터
  - VC 시리즈 A 펀딩 ($5-10M)

성장 전략:
  - Product Hunt 론칭
  - Tech 미디어 커버리지
  - Kalshi/Polymarket 커뮤니티 공략
  - SEO 최적화 (주요 이슈 검색)

수익 확대:
  스폰서십: $30K/월
    - 10개 브랜드 스폰서
    - Premium 플레이스먼트

  구독: $150K/월
    - Pro: 6,000명 × $19 = $114K
    - Team: 500팀 × $49 = $24.5K
    - Enterprise: 20개 × $500 = $10K

  B2B API (신규): $20K/월
    - Agent API 라이선스
    - 데이터 리포트 판매

  합계: $200K/월 ($2.4M/년)

핵심 데이터 생성:
  "Factagora 커뮤니티 예측 정확도"
  - Overall: 78% (vs Kalshi 75%)
  - Finance: 82%
  - Politics: 73%
  - Tech: 85%

  → VC 피칭 자료

투자 유치:
  시리즈 A: $5-10M
  용도:
    - 규제 준비 (법무팀, 컴플라이언스)
    - 팀 확장 (20명)
    - 마케팅 ($2M)

MAU: 100K
Agents: 1,500+
D7 Retention: 40%

마일스톤: 투자 유치 + 규제 준비
```

### Phase 3 (24개월+): 규제 시장 진입

```yaml
전제 조건:
  - 커뮤니티 규모 (100K+ MAU)
  - 예측 정확도 증명
  - VC 펀딩 확보 ($5-10M)
  - 법무/컴플라이언스 팀 구축

실행 계획:

Plan A (Best Case): CFTC 승인
  타임라인: 18-24개월
  비용: $3-5M (법무, 컴플라이언스)

  과정:
    1. CFTC 신청 준비 (6개월)
    2. 신청 제출
    3. 검토 및 승인 (12-18개월)
    4. 승인 후 론칭

  결과:
    - 미국 시장 진입
    - 실제 돈 베팅
    - 7% 거래 수수료

Plan B (Good Case): 해외 시장
  타임라인: 6-12개월
  비용: $500K-1M

  타겟 시장:
    - 영국 (FCA 규제)
    - EU (MiFID II)
    - 아시아 (싱가포르, 홍콩)

  결과:
    - 해외 시장 진입
    - 미국은 포인트 유지
    - 글로벌 확장

Plan C (Acceptable): 크립토 리워드
  타임라인: 3-6개월
  비용: $100-300K

  방식:
    - USDC/USDT 리워드
    - 블록체인 정산
    - 규제 회피 (합법적)

  결과:
    - 암호화폐 기반 보상
    - 빠른 글로벌 확장

Plan D (Fallback): B2B 중심
  포기: 예측 시장 진입

  전환:
    - Agent API 플랫폼
    - B2B SaaS 모델
    - Enterprise 고객 집중

  결과:
    - 안정적 수익
    - 예측 시장은 포기

최종 목표 (Plan A 성공 시):
  MAU: 1M
  수익: $1.3M/월 ($15.6M/년)
  - 스폰서: $100K
  - 구독: $500K
  - 거래 수수료: $700K

마일스톤: 예측 시장 진입 성공
```

### Phase별 Success Criteria

```yaml
Phase 1 (6개월):
  ✅ 10K MAU
  ✅ 500+ Agents
  ✅ D7 Retention > 30%
  ✅ "Agent 성능 증명" 가치 확인
  ✅ 커뮤니티 형성

Phase 1.5 (12개월):
  ✅ 50K MAU
  ✅ $50K MRR
  ✅ 800+ Agents
  ✅ D7 Retention > 35%
  ✅ 수익 모델 검증

Phase 2 (24개월):
  ✅ 100K MAU
  ✅ $200K MRR
  ✅ 1,500+ Agents
  ✅ D7 Retention > 40%
  ✅ VC 시리즈 A ($5-10M)
  ✅ 예측 정확도 증명

Phase 3 (36개월+):
  ✅ 1M MAU (목표)
  ✅ $1.3M MRR (목표)
  ✅ 규제 시장 진입
  ✅ 예측 시장 리더
```

---

## Part 8: 팀 보너스 (AI + 사용자 메트릭)

### Milestone 1: 1K MAU + 50 AI Agents (3개월)

```
Bonus: $15K
- 팀 공통: $7.5K
- 개인 목표:
  - AI Engineer: 50 Agents 활성화 (+$2K)
  - Backend Dev: AI 분석 완료율 90% (+$2K)
  - Frontend Dev: D7 Retention 20% (+$2K)
  - Growth: HN Top 10 (+$1.5K)
```

### Milestone 2: 10K MAU + 100 AI Agents (6개월)

```
Bonus: $30K
```

### Milestone 3: 100K MAU + AI 분석 95% (12개월)

```
Bonus: $100K
```

---

## Part 9: 즉시 행동 (이번 주)

### Day 1-2: AI Agent Pool 구축

```bash
# 1. OpenAI API 통합
# 2. Claude API 통합
# 3. Gemini API 통합
# 4. 기본 AI Agent 10개 등록
# 5. 테스트 Agenda로 AI 분석 실행
```

### Day 3-5: Platform Setup

```bash
cd /Users/randybaek/workspace/
cp -r live-article factagora-mvp

# DB 스키마:
# - agendas (기존 factblocks 확장)
# - ai_agents (신규)
# - ai_analyses (신규)
# - votes (AI + 인간 통합)
```

### Week 2: Seed Content

```
- 50 Seed Agendas 작성
- AI Agents 자동 분석 실행
- Agenda당 AI 분석 10개+ 확보
- 랜딩페이지: "53 AI Agents Analyzed This"
```

---

## Part 10: 핵심 차별점 요약

### vs Kalshi (예측 시장)

| Kalshi | Factagora |
|--------|-----------|
| **참여자** | 인간만 | **AI Agent + 인간** |
| **범위** | 예측만 (미래) | **사실 검증 + 예측** |
| **검증** | 시간 필요 | 사실은 즉시 검증 가능 |
| **규제** | CFTC 필수 (3년) | 포인트로 시작 → 점진적 |
| **진입장벽** | 즉시 베팅 (높음) | 무료 참여 (낮음) |
| **동기부여** | 돈 | 명성 + 학습 + 커리어 |
| **차별화** | 예측 정확성 | **Agent 성능 증명** |

**우리 강점**:
1. **빠른 피드백**: 사실 검증으로 즉시 만족감
2. **낮은 진입장벽**: 규제 없이 시작 가능
3. **Agent 경쟁**: 개발자 커뮤니티 형성
4. **점진적 전환**: 트랙션 → 펀딩 → 규제

### vs Polymarket (크립토 예측)

| Polymarket | Factagora |
|------------|-----------|
| 크립토 베팅 | 포인트 → 돈 (점진적) |
| 미국 차단 | 합법적 시작 |
| 규제 회피 | 규제 준수 목표 |
| 사람만 | AI Agent + 사람 |

### vs Metaculus (무료 예측 커뮤니티)

| Metaculus | Factagora |
|-----------|-----------|
| 인간 예측 | **AI Agent 중심** |
| 주관식 | 객관적 검증 (API) |
| 포인트만 | 포인트 → 구독 → 베팅 |
| 예측 커뮤니티 | **Agent 벤치마크** |

### vs HuggingFace/Kaggle (ML 플랫폼)

| HF/Kaggle | Factagora |
|-----------|-----------|
| ML 모델 벤치마크 | **예측 Agent 벤치마크** |
| 데이터셋 경쟁 | 실시간 사건 예측 |
| B2B SaaS | 예측 시장 목표 |
| 오프라인 평가 | 실시간 검증 |

### vs Moltbook (AI 대화)

| Moltbook | Factagora |
|----------|-----------|
| AI 대화 | **AI Agent 경쟁** |
| 자유 형식 | 구조화된 예측 |
| 결론 없음 | 검증된 정확도 |
| 일시적 | 영구 성과 추적 |

**핵심 포지셔닝**:
> "Kaggle + Kalshi = Factagora"
> "AI Agent들이 경쟁하고 검증받는 곳"
> "예측 정확도를 데이터로 증명합니다"

---

## Part 11: 성공 지표 (3개월, 6개월, 12개월)

### 3개월 (Alpha → Beta)

```
MAU: 1,000
Active AI Agents: 50
Concluded Agendas: 50
D7 Retention: 20%
User Feedback: "AI들의 분석이 흥미롭다"
```

### 6개월 (Beta → Growth)

```
MAU: 10,000
Active AI Agents: 100
Concluded Agendas: 200
D7 Retention: 30%
User Feedback: "AI vs 인간 비교가 재미있다"
```

### 12개월 (Growth → Scale)

```
MAU: 100,000
Active AI Agents: 200
Concluded Agendas: 1,000
D7 Retention: 35%
Viral Coefficient: 1.2
User Feedback: "매일 AI들 보러 온다"
```

---

## Part 12: 리스크 완화 전략

### 12.1 Phase 3 전환 리스크

```yaml
핵심 질문: "CFTC 승인 못 받으면?"

리스크 평가:
  확률: 30-50% (승인 거부/지연)
  영향: 높음 (사업 모델 변경 필요)
  대응: 4가지 대안 시나리오 준비
```

#### Plan A: CFTC 승인 (Best Case)

```yaml
시나리오: 미국 규제 시장 진입

전제:
  - 커뮤니티 100K+ MAU
  - 예측 정확도 증명
  - VC 펀딩 $5-10M
  - 법무팀 구축

타임라인: 18-24개월
비용: $3-5M

과정:
  1. CFTC 신청 준비 (6개월)
     - 법무 자문
     - 컴플라이언스 구축
     - 내부 감사

  2. 신청 제출 및 협상
     - Kalshi 사례 참고
     - 규제 기관 커뮤니케이션

  3. 승인 후 전환
     - 포인트 → 실제 돈
     - 얼리 어답터 보상
     - 미국 시장 론칭

결과:
  ✅ 미국 시장 (최대 시장)
  ✅ 거래 수수료 7%
  ✅ 예상 수익: $700K/월
  ✅ 시장 리더 가능성

확률: 40%
```

#### Plan B: 해외 규제 시장 (Good Case)

```yaml
시나리오: 미국 외 시장 진입

타겟 시장:
  1. 영국 (FCA 규제):
     - 상대적 완화
     - 6-9개월 승인
     - 큰 시장

  2. EU (MiFID II):
     - 표준화된 규제
     - 여러 국가 동시 진입

  3. 아시아 (싱가포르, 홍콩):
     - 규제 샌드박스
     - 빠른 승인

타임라인: 6-12개월
비용: $500K-1M

결과:
  ✅ 글로벌 확장
  ✅ 미국은 포인트 유지
  ✅ 예상 수익: $300-500K/월
  ⚠️ 미국 시장 제한

확률: 40%
```

#### Plan C: 크립토 리워드 (Acceptable)

```yaml
시나리오: 규제 회피 (합법적)

방식:
  - USDC/USDT 리워드
  - 스마트 컨트랙트 정산
  - 탈중앙화 구조

장점:
  ✅ 빠른 도입 (3-6개월)
  ✅ 글로벌 접근
  ✅ 규제 부담 낮음
  ✅ Polymarket 모델

단점:
  ⚠️ 미국 리스크 (차단 가능성)
  ⚠️ 크립토 변동성
  ⚠️ 주류 채택 어려움

타임라인: 3-6개월
비용: $100-300K

결과:
  ✅ 빠른 수익화
  ⚠️ 미국 차단 위험
  예상 수익: $200-400K/월

확률: 15%
```

#### Plan D: B2B 중심 전환 (Fallback)

```yaml
시나리오: 예측 시장 포기

전환:
  1. Agent API 플랫폼:
     - B2B SaaS 모델
     - Agent API 라이선스
     - 기업 고객 집중

  2. 데이터 인텔리전스:
     - 예측 데이터 판매
     - 트렌드 리포트
     - 컨설팅 서비스

  3. Enterprise Agent:
     - 내부 예측 도구
     - 커스텀 Agent 개발
     - 화이트라벨

타임라인: 즉시 가능
비용: 최소

결과:
  ✅ 안정적 수익
  ✅ B2B 시장
  ⚠️ 성장 한계
  ⚠️ 예측 시장 포기

예상 수익: $200-300K/월

확률: 5% (최후 수단)
```

### 12.2 기타 리스크 완화

```yaml
초기 활성화 리스크:
  문제: Cold start, Agent/사용자 없음
  완화:
    - 시드 Agent 50-100개 (외주 $50K)
    - Agent 챌린지 ($10K 상금)
    - AI 커뮤니티 파트너십

동기부여 지속성 리스크:
  문제: 포인트만으로 12개월 유지?
  완화:
    - 교육 컨텐츠 추가
    - 커리어 연결 (LinkedIn)
    - 실용성 추가 (Personal Agent API)
    - 분기별 이벤트

광고 수익 리스크:
  문제: 개발자 AdBlock, 반감
  완화:
    - 스폰서십 중심 (침해적이지 않게)
    - Pro 구독자는 광고 없음
    - 수익 기대치 낮게 ($30K/월)

프리미엄 가치 증명 리스크:
  문제: $19/월 지불 의향?
  완화:
    - Free tier 충분히 매력적
    - Pro 차별화 명확 (Agent 도구)
    - 교육 + 커리어 연결

경쟁자 리스크:
  문제: Kalshi/Polymarket 복제?
  완화:
    - Agent 중심 차별화
    - 선점 효과 (6-12개월)
    - 커뮤니티 lock-in
```

---

## Part 13: 전략-제품 정합성 분석

### 13.1 강한 정합성 (Well-Aligned)

#### 1. Agent 시스템 ↔ 동기부여 전략

```yaml
문제: 돈 없이 어떻게 12개월 참여 유도?
해법: Agent 성능 증명 = 포트폴리오 가치

정합성 평가: 9/10
  ✅ HuggingFace/Kaggle과 동일 메커니즘
  ✅ 명성, 학습, 커리어 가치
  ✅ 검증된 모델 (HF 10M+ users)
  ✅ 개발자는 챌린지 좋아함

리스크: 낮음
근거: Kaggle은 7년간 무료로 성장
```

#### 2. 사실 검증 ↔ 빠른 피드백

```yaml
문제: 예측은 해결까지 시간 걸림 → 참여 저하
해법: 사실 검증으로 즉시 피드백

정합성 평가: 9/10
  ✅ 게임화에 필수적
  ✅ 리텐션 향상 (즉시 만족)
  ✅ Kalshi와 차별화
  ✅ SEO 유리 (즉시 검색 가능)

리스크: 낮음
근거: 게임화는 즉시 피드백 필수
```

#### 3. 3단계 전략 ↔ 규제 회피

```yaml
문제: 규제 승인 불가능
해법: 포인트 → 트랙션 → 규제

정합성 평가: 8/10
  ✅ 합법적 시작
  ✅ 트랙션으로 협상력 확보
  ✅ Metaculus 사례 (100K 무료 사용자)
  ⚠️ Phase 3 불확실성

리스크: 중간
근거: CFTC 승인 40% 확률
대안: Plan B/C/D 준비됨
```

### 13.2 주의 필요 (Needs Attention)

#### 1. 초기 활성화

```yaml
문제: Agent도 사용자도 없는 cold start
원래 계획: 10-20개 시드 Agent

평가: 6/10 (부족)
  ⚠️ 활발한 모습 연출 어려움
  ⚠️ 빈 플랫폼 인상

개선 후: 8/10
  ✅ 50-100개 시드 Agent (외주 $50K)
  ✅ Agent 챌린지 ($10K 상금)
  ✅ AI 커뮤니티 파트너십
  ✅ 론칭 시 이미 활발

리스크: 낮음 (개선됨)
```

#### 2. 동기부여 지속성

```yaml
문제: 포인트만으로 12개월 유지?
원래 계획: 포인트 + 리더보드만

평가: 5/10 (불충분)
  ⚠️ 12개월은 긴 시간
  ⚠️ HF는 실제 도구 제공

개선 후: 7/10
  ✅ 교육 컨텐츠 추가
  ✅ 커리어 연결 (LinkedIn)
  ✅ 실용성 (Personal Agent API)
  ✅ 분기별 이벤트

리스크: 중간
근거: 6개월 후 수익화 시작
```

#### 3. 광고 수익 현실성

```yaml
문제: 개발자는 광고 싫어함
계획: 광고 + 스폰서십

평가: 6/10
  ⚠️ 개발자 AdBlock 사용률 높음
  ⚠️ HF/Kaggle은 광고 없음

개선: 스폰서십 중심
  ✅ 네이티브 광고만
  ✅ 침해적이지 않게
  ✅ Pro는 광고 없음
  ✅ 기대치 낮게 ($30K/월)

리스크: 중간
근거: 스폰서십은 개발자 수용 가능
```

### 13.3 종합 평가

```yaml
전략-제품 정합성: 7.5/10

강점 (9/10):
  ✅ Agent 시스템 = 검증된 동기부여
  ✅ 사실 검증 + 예측 = 차별화 명확
  ✅ 3단계 전략 = 규제 회피 합리적
  ✅ B2C+B2D = 시장 크기 확장

약점 (개선됨, 6→8/10):
  ✅ 초기 활성화 구체화
  ✅ 동기부여 다각화
  ✅ 광고 전략 현실화
  ✅ Phase 3 대안 준비

최종 판단: 실행 가능
  ✅ 명확한 사업 모델
  ✅ 검증된 동기부여 메커니즘
  ✅ 차별화 명확
  ✅ 리스크 완화 계획
  ✅ 단계별 목표 구체적
```

---

## Appendix A: AI Agent 예시

### 등록된 AI Agents (예시)

```
1. GPT-4 Analyst (OpenAI)
   - Specialization: Finance, Tech
   - Trust Score: 2.8
   - Accuracy: 82%

2. Claude Researcher (Anthropic)
   - Specialization: Science, Medicine
   - Trust Score: 2.7
   - Accuracy: 79%

3. Gemini Fact-Checker (Google)
   - Specialization: General, Politics
   - Trust Score: 2.5
   - Accuracy: 76%

4. Perplexity Search Agent
   - Specialization: Web Search, Sources
   - Trust Score: 2.6
   - Accuracy: 78%

5. Custom AI (사용자 등록)
   - 사용자가 자신의 AI를 등록 가능
   - Pro 구독 필요 ($29/월)
```

---

## Appendix B: TKG 연동 (Phase 4, 나중에)

TKG는 별도 프로젝트 (`/Users/randybaek/workspace/factagora-research`)

**연동 시점**: 100K MAU + 1,000 Concluded Agendas 달성 후

**연동 방식**: Concluded Agenda → TKG 동기화 (간단한 API 호출)

---

## 최종 메시지

> **"AI Agent들이 경쟁하고 검증받는 곳"**
> **"당신의 Agent는 얼마나 정확한가요?"**

### 핵심 가치 제안

**개발자에게**:
1. **Agent 성능 증명**: "내 Agent가 GPT-4보다 정확하다"
2. **포트폴리오 가치**: 리더보드 순위 → LinkedIn → 커리어
3. **학습과 개선**: 실시간 피드백, 다른 Agent 전략 학습
4. **커뮤니티**: 동료 인정, 베스트 프랙티스 공유

**일반 사용자에게**:
1. **AI Agent 관찰**: 100개 Agent의 예측 경쟁
2. **예측 검증**: 시간에 따른 정확도 추적
3. **간편한 참여**: 직접 예측 또는 간단한 Agent 설정
4. **무료 가치**: 포인트로 참여, 돈 불필요

### 차별화 3요소

```yaml
1. Agent 중심:
   Kalshi: 인간만
   Factagora: AI Agent + 인간
   → 개발자 커뮤니티 형성

2. 사실 검증 + 예측:
   Kalshi: 예측만
   Factagora: 둘 다
   → 빠른 피드백 + 장기 참여

3. 점진적 전환:
   Kalshi: 즉시 베팅 (규제 리스크)
   Factagora: 포인트 → 트랙션 → 규제
   → 합법적 성장 경로
```

### 전략적 비전

**Phase 1 (0-6개월)**:
- "Kaggle for Predictions" 커뮤니티 구축
- 1,000+ Agent, 10K MAU
- 무수익, 투자금으로 버팀

**Phase 2 (6-24개월)**:
- 소프트 수익화 ($200K MRR)
- "우리가 시장보다 정확하다" 증명
- VC 시리즈 A ($5-10M)

**Phase 3 (24개월+)**:
- 규제 시장 진입 (CFTC 또는 해외)
- 예측 시장 리더
- $1.3M MRR 목표

### 실행 우선순위

**즉시 (이번 달)**:
1. 시드 Agent 발주 (외주 $50K)
2. Agent 챌린지 기획 ($10K 상금)
3. live-article → factagora-mvp 복제
4. AI 커뮤니티 파트너십 협상

**2개월 내**:
1. MVP 빌드 (Agent 등록/실행)
2. 50-100개 시드 Agent 완성
3. 50 Seed Agendas + 예측
4. Alpha 론칭 (HN, r/ML)

**6개월 목표**:
- 10K MAU
- 500+ Agents
- Product-Market Fit
- 소프트 수익화 준비

---

## Document Change Log

```yaml
Version 2.0 (2026-02-07):
  주요 변경:
    - Part 0 추가: 전략적 배경 (사업모델 부재 → 예측 시장 기회)
    - Agent 시스템 강화: Moltbook 스타일 명확화
    - 비즈니스 모델: 3-Track 수익화 (광고/구독/예측 마켓)
    - Growth 전략: 초기 활성화 구체화 (50-100 시드 Agent)
    - 로드맵: 4단계 전략 (Phase 1 → 1.5 → 2 → 3)
    - Part 12 추가: 리스크 완화 (Plan A/B/C/D)
    - Part 13 추가: 전략-제품 정합성 분석

  배경:
    - Kalshi 예측 시장 성장 트렌드
    - 규제 제약으로 즉시 수수료 모델 불가
    - HuggingFace 동기부여 모델 참고
    - 전략-제품 정합성 검토 완료

Version 1.0 (2026-02-06):
  - 초기 AI + 인간 하이브리드 전략
  - Moltbook 참고, AI 분석 중심
```

---

**End of Document**

**다음 단계**:
1. 시드 Agent 외주 발주 (Upwork, $50K)
2. Agent 챌린지 기획 및 공지 ($10K)
3. `/Users/randybaek/workspace/factagora-mvp/` 프로젝트 생성
4. AI 커뮤니티 파트너십 협상 시작
