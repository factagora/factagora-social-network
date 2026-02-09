# Factagora Resolution Mechanism (결과 확정 시스템)

> **Version**: 1.0
> **Date**: 2026-02-07
> **Based on**: Kalshi, Polymarket, Metaculus 분석

---

## 📋 Executive Summary

예측 마켓의 핵심은 **Resolution (결과 확정)**입니다. 누가, 언제, 어떻게 결과를 확정하느냐에 따라 신뢰도와 분쟁 비율이 결정됩니다.

**Factagora 전략**: Hybrid Resolution (자동 + 커뮤니티 + 전문가)

---

## Part 1: 경쟁사 Resolution 분석

### 1.1 Kalshi (규제받는 예측 마켓)

**Resolution Process**:
```
1. Market Closure (시장 마감)
   ↓
2. Data Collection (1-12시간)
   - 공식 데이터 소스에서 결과 확인
   - 예: BLS (고용 지표), NOAA (날씨), Stock APIs
   ↓
3. Resolution (결과 확정)
   - Kalshi 팀이 공식 데이터 기반 확정
   - 계약서에 명시된 기준 적용
   ↓
4. Settlement (3시간 이내)
   - 자동으로 승자에게 $1 지급
   - API로 정산 정보 제공
```

**특징**:
- ✅ **객관적**: 공식 데이터 소스 (논쟁 최소화)
- ✅ **자동화**: API로 데이터 가져와서 자동 확정
- ✅ **빠름**: 대부분 12시간 이내
- ❌ **한정적**: 객관적 데이터 있는 것만 가능

**예시 Markets**:
- "Federal Reserve will cut rates by 0.25% in March 2026"
  - Source: Federal Reserve official announcement
  - Resolution: 3 hours after FOMC meeting
- "Monthly US jobs report will exceed 200K"
  - Source: Bureau of Labor Statistics
  - Resolution: 1 hour after BLS release

**API 구조**:
```json
{
  "series": {
    "title": "Monthly Jobs Report",
    "settlement_source": {
      "name": "Bureau of Labor Statistics",
      "url": "https://www.bls.gov/ces/",
      "api_endpoint": "https://api.bls.gov/publicAPI/v2/timeseries/data/CES0000000001"
    },
    "resolution_method": "automatic",
    "settlement_delay_hours": 1
  }
}
```

**Sources**:
- [Market Rules | Kalshi Help Center](https://help.kalshi.com/markets/markets-101/market-rules)
- [Market Outcomes | Kalshi Help Center](https://help.kalshi.com/markets/markets-101/market-outcomes)
- [Kalshi API Documentation](https://docs.kalshi.com/api-reference/market/get-series)

---

### 1.2 Polymarket (Crypto 예측 마켓)

**Resolution Process**:
```
1. Market Closure
   ↓
2. Proposal (누구나 제안 가능)
   - $750 Bond 필요
   - 결과 제안 (Yes/No)
   ↓
3. Challenge Period (2시간)
   - 다른 사람이 이의 제기 가능
   - 잘못된 제안 → Bond 손실
   ↓
4. Oracle Verification
   - UMA Optimistic Oracle
   - Chainlink Feeds
   ↓
5. On-chain Settlement
   - 스마트 컨트랙트 자동 정산
   - 승자에게 $1/share
```

**특징**:
- ✅ **탈중앙화**: 커뮤니티가 결과 제안
- ✅ **경제적 인센티브**: Bond로 잘못된 제안 방지
- ✅ **On-chain**: 투명하고 변조 불가
- ❌ **느림**: Challenge period 2시간 필요
- ❌ **분쟁 가능**: 애매한 경우 논쟁

**Bond 메커니즘**:
- 올바른 제안 → Bond 반환 + 보상
- 잘못된 제안 → Bond 몰수 ($750 손실)
- 이의 제기 성공 → Bond + 보상

**Sources**:
- [How Are Markets Resolved? - Polymarket Documentation](https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-resolved)

---

### 1.3 Metaculus (커뮤니티 예측 플랫폼)

**Resolution Process**:
```
1. Question Closure
   ↓
2. Community Moderation
   - 사용자들이 결과 제안
   - 투표로 합의
   ↓
3. Curator Panel Review
   - 전문가 패널이 최종 검토
   - 애매한 경우 해석
   ↓
4. Final Resolution
   - Play money 정산 (실제 돈 X)
```

**특징**:
- ✅ **유연함**: 주관적/애매한 질문도 가능
- ✅ **전문성**: Curator panel로 품질 보장
- ✅ **분쟁 해결**: 커뮤니티 합의
- ❌ **느림**: 며칠 소요 가능
- ❌ **Play money**: 실제 돈 아님

**Curator Panel**:
- Metaculus에서 선정한 전문가들
- 도메인별 전문성 (Science, Politics, etc.)
- 최종 결정권

**Sources**:
- [Metaculus and Markets: What's the Difference?](https://www.metaculus.com/notebooks/38198/metaculus-and-markets-whats-the-difference/)

---

## Part 2: Factagora Resolution 설계

### 2.1 Agenda 유형별 Resolution 전략

#### Type 1: Objective Facts (객관적 사실)

```
예시:
- "Tesla 2025 revenue exceeded $100B"
- "Bitcoin reached $100K in 2026"
- "US unemployment rate dropped below 4% in March 2026"

Resolution Method: AUTOMATIC (API-based)

Data Sources:
- Stock APIs (Yahoo Finance, Alpha Vantage)
- Government APIs (BLS, Federal Reserve)
- Public Records (SEC filings, company reports)

Timeline:
- Real-time (주식 가격, crypto)
- 1-24 hours (정부 발표)
- 1-7 days (회사 공시)
```

**구현**:
```typescript
interface ObjectiveAgenda extends Agenda {
  resolution_type: 'automatic';
  data_source: {
    provider: 'yahoo_finance' | 'bls' | 'sec_edgar';
    api_endpoint: string;
    query_params: Record<string, string>;
  };
  resolution_criteria: {
    field: string;  // "closing_price", "employment_rate"
    operator: '>' | '<' | '>=' | '<=' | '==';
    threshold: number;
  };
  resolution_date: Date;  // 언제 확인할지
}

// 자동 Resolution
async function autoResolveAgenda(agenda: ObjectiveAgenda) {
  // 1. API에서 데이터 가져오기
  const data = await fetchDataFromSource(agenda.data_source);

  // 2. 기준 적용
  const value = data[agenda.resolution_criteria.field];
  const result = compareValue(
    value,
    agenda.resolution_criteria.operator,
    agenda.resolution_criteria.threshold
  );

  // 3. Resolution 확정
  await resolveAgenda(agenda.id, {
    result: result ? 'true' : 'false',
    evidence: data,
    resolved_at: new Date(),
    resolution_method: 'automatic'
  });

  // 4. 보상 분배
  await distributeRewards(agenda.id);
}
```

---

#### Type 2: Subjective Facts (주관적 사실)

```
예시:
- "GPT-5 is significantly better than GPT-4"
- "The new iPhone design is innovative"
- "Movie X deserves an Oscar nomination"

Resolution Method: COMMUNITY VOTE

Process:
1. Resolution Period (3-7 days)
2. Community votes on outcome
3. Weighted by Trust Score
4. Threshold: 67% agreement

Timeline:
- 3-7 days after Agenda closure
```

**구현**:
```typescript
interface SubjectiveAgenda extends Agenda {
  resolution_type: 'community';
  resolution_period_days: number;  // 3-7
  consensus_threshold: number;  // 0.67 (67%)
}

async function communityResolveAgenda(agenda: SubjectiveAgenda) {
  // 1. Resolution voting 시작
  await openResolutionVoting(agenda.id);

  // 2. Community votes (Trust Score 가중)
  const votes = await collectResolutionVotes(agenda.id);

  // 3. 가중 평균 계산
  const weightedResult = calculateWeightedAverage(votes);

  // 4. Consensus 확인
  if (weightedResult.confidence >= agenda.consensus_threshold) {
    await resolveAgenda(agenda.id, {
      result: weightedResult.outcome,
      confidence: weightedResult.confidence,
      resolution_method: 'community'
    });
  } else {
    // 5. Consensus 실패 → Expert Panel
    await escalateToExpertPanel(agenda.id);
  }
}
```

---

#### Type 3: Future Predictions (미래 예측)

```
예시:
- "AGI will be achieved before 2027"
- "Biden will win 2024 election"
- "Ethereum will reach $5K in 2026"

Resolution Method: HYBRID
- Objective 기준 있으면 → Automatic
- 애매하면 → Community + Expert

Timeline:
- Resolution Date 명시 필수
- 해당 날짜 이후 확정
```

**구현**:
```typescript
interface PredictionAgenda extends Agenda {
  resolution_type: 'hybrid';
  resolution_date: Date;  // 필수
  primary_method: 'automatic' | 'community';
  fallback_method: 'community' | 'expert_panel';
  data_source?: DataSource;  // Automatic인 경우
}

async function hybridResolveAgenda(agenda: PredictionAgenda) {
  // 1. Primary method 시도
  if (agenda.primary_method === 'automatic') {
    try {
      return await autoResolveAgenda(agenda);
    } catch (error) {
      console.log('Auto resolution failed, fallback to community');
    }
  }

  // 2. Fallback to community
  if (agenda.fallback_method === 'community') {
    const result = await communityResolveAgenda(agenda);
    if (result.consensus_reached) {
      return result;
    }
  }

  // 3. Final fallback: Expert Panel
  return await expertPanelResolve(agenda);
}
```

---

### 2.2 Resolution Authority (권한)

#### Level 1: Automatic (자동)

```
권한: System (API)
속도: 1-24시간
정확도: 99%+
분쟁율: <1%
비용: 낮음 (API 비용만)

적용:
- 주식 가격
- 정부 통계
- 객관적 수치
```

#### Level 2: Community (커뮤니티)

```
권한: Trust Score 가중 투표
속도: 3-7일
정확도: 85-95%
분쟁율: 5-15%
비용: 없음 (참여 인센티브)

적용:
- 주관적 판단
- 정성적 평가
- 애매한 기준
```

#### Level 3: Expert Panel (전문가 패널)

```
권한: 도메인 전문가 (Trust Score 2.5+)
속도: 7-14일
정확도: 95%+
분쟁율: <5%
비용: 중간 (전문가 보상)

적용:
- Community consensus 실패
- 복잡한 기술적 판단
- 논란의 여지가 큰 주제
```

#### Level 4: Agenda Creator (생성자)

```
권한: Agenda 생성자 (제한적)
속도: 즉시
정확도: 변동
분쟁율: 높음 (잠재적)
비용: 없음

적용:
- Private Agora only
- 소규모 커뮤니티
- Challenge 가능
```

---

### 2.3 Resolution Timeline (타임라인)

#### Agenda 생성 시 명시

```typescript
interface AgendaResolutionTimeline {
  // 1. Agenda 마감 시점
  closing_date: Date;  // 투표/베팅 마감

  // 2. Resolution 확정 시점
  resolution_date: Date;  // 결과 확정 시점

  // 3. 대기 기간 (optional)
  waiting_period?: {
    reason: 'data_availability' | 'verification' | 'community_vote';
    duration_hours: number;
  };

  // 4. Settlement 시점
  settlement_date: Date;  // 보상 분배 시점
}
```

#### 예시: Objective Fact

```
Agenda: "Tesla 2025 Q4 earnings > $120B"

Timeline:
- Created: 2025-01-01
- Closing: 2026-01-31 (투표 마감)
- Resolution: 2026-02-15 (Tesla earnings call)
- Waiting: 1 hour (API data sync)
- Settlement: 2026-02-15 (자동 정산)

Total: 14개월 (생성 → 정산)
```

#### 예시: Subjective Fact

```
Agenda: "GPT-5 is significantly better than GPT-4"

Timeline:
- Created: 2026-01-01
- Closing: 2026-06-30 (GPT-5 출시 후 3개월)
- Resolution Start: 2026-07-01 (Community vote 시작)
- Waiting: 7 days (Community consensus)
- Expert Panel: +14 days (if needed)
- Settlement: 2026-07-22 (최대)

Total: 6.5개월 (생성 → 정산)
```

---

### 2.4 Dispute Resolution (분쟁 해결)

#### Challenge Mechanism (Polymarket 스타일)

```typescript
interface ResolutionChallenge {
  agenda_id: string;
  challenger_id: string;
  bond_amount: number;  // $100 (Polymarket은 $750)
  reason: string;
  evidence: Evidence[];
  challenge_period: number;  // 48 hours
}

// Challenge 프로세스
async function challengeResolution(challenge: ResolutionChallenge) {
  // 1. Bond 예치
  await depositBond(challenge.challenger_id, challenge.bond_amount);

  // 2. Challenge period 시작 (48시간)
  await startChallengePeriod(challenge);

  // 3. Community review
  const votes = await collectChallengeVotes(challenge);

  // 4. 결과
  if (votes.support_challenge > 0.6) {
    // Challenge 성공
    await refundBond(challenge.challenger_id);
    await rewardChallenger(challenge.challenger_id, challenge.bond_amount * 2);
    await reopenResolution(challenge.agenda_id);
  } else {
    // Challenge 실패
    await confiscateBond(challenge.challenger_id);
  }
}
```

#### Appeal Process (Metaculus 스타일)

```typescript
interface ResolutionAppeal {
  agenda_id: string;
  appellant_id: string;
  appeal_fee: number;  // $50
  justification: string;
  expert_panel_size: number;  // 3-5
}

// Appeal 프로세스
async function appealResolution(appeal: ResolutionAppeal) {
  // 1. Appeal fee 지불
  await chargeAppealFee(appeal.appellant_id, appeal.appeal_fee);

  // 2. Expert Panel 소집
  const panel = await selectExpertPanel(appeal.agenda_id, appeal.expert_panel_size);

  // 3. Panel review (7-14 days)
  const decision = await panelReview(panel, appeal);

  // 4. 결과
  if (decision.overturn_resolution) {
    // Appeal 성공
    await refundAppealFee(appeal.appellant_id);
    await updateResolution(appeal.agenda_id, decision.new_result);
    await redistributeRewards(appeal.agenda_id);
  } else {
    // Appeal 실패
    // Fee는 Expert Panel에게 보상
    await distributeAppealFeeToPanel(panel, appeal.appeal_fee);
  }
}
```

---

## Part 3: Factagora Resolution 구현

### 3.1 Resolution 워크플로우

```
┌─────────────────────────────────────┐
│  Agenda Created                     │
│  - Resolution type 지정              │
│  - Timeline 설정                     │
│  - Data source (if automatic)       │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Voting/Betting Period              │
│  - Users vote/bet                   │
│  - AI agents analyze                │
└──────────┬──────────────────────────┘
           │
           ▼ (Closing Date)
┌─────────────────────────────────────┐
│  Resolution Process                 │
│                                     │
│  Type 1: Automatic                  │
│  ├─ Fetch API data                  │
│  ├─ Apply criteria                  │
│  └─ Confirm (1-24h)                 │
│                                     │
│  Type 2: Community                  │
│  ├─ Open voting (3-7d)              │
│  ├─ Weighted consensus              │
│  └─ Confirm or Escalate             │
│                                     │
│  Type 3: Hybrid                     │
│  ├─ Try automatic                   │
│  ├─ Fallback community              │
│  └─ Final: Expert panel             │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Challenge Period (48h)             │
│  - Anyone can challenge             │
│  - Bond required ($100)             │
│  - Community votes on challenge     │
└──────────┬──────────────────────────┘
           │
           ▼ (If challenged & upheld)
┌─────────────────────────────────────┐
│  Appeal Process (7-14d)             │
│  - Appeal fee ($50)                 │
│  - Expert panel review              │
│  - Final decision                   │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Settlement (3h)                    │
│  - Calculate rewards                │
│  - Distribute winnings              │
│  - Update Trust Scores              │
└─────────────────────────────────────┘
```

---

### 3.2 Data Source 정의

#### Financial Data

```typescript
const FINANCIAL_SOURCES = {
  stocks: {
    provider: 'Yahoo Finance',
    api: 'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}',
    fields: ['close', 'volume', 'marketCap'],
    latency: 'real-time',
    cost: 'free'
  },
  crypto: {
    provider: 'CoinGecko',
    api: 'https://api.coingecko.com/api/v3/simple/price',
    fields: ['usd', 'market_cap', 'volume'],
    latency: 'real-time',
    cost: 'free'
  },
  forex: {
    provider: 'Exchange Rates API',
    api: 'https://api.exchangerate.host/latest',
    fields: ['rates'],
    latency: 'daily',
    cost: 'free'
  }
};
```

#### Government Data

```typescript
const GOVERNMENT_SOURCES = {
  employment: {
    provider: 'Bureau of Labor Statistics',
    api: 'https://api.bls.gov/publicAPI/v2/timeseries/data/CES0000000001',
    fields: ['unemployment_rate', 'nonfarm_payroll'],
    latency: '1 month',
    cost: 'free'
  },
  fed_rates: {
    provider: 'Federal Reserve',
    api: 'https://www.federalreserve.gov/datadownload/Output.aspx',
    fields: ['federal_funds_rate'],
    latency: 'meeting + 1 hour',
    cost: 'free'
  },
  weather: {
    provider: 'NOAA',
    api: 'https://api.weather.gov/stations/{station}/observations',
    fields: ['temperature', 'precipitation'],
    latency: 'hourly',
    cost: 'free'
  }
};
```

#### Company Data

```typescript
const COMPANY_SOURCES = {
  earnings: {
    provider: 'SEC EDGAR',
    api: 'https://data.sec.gov/submissions/CIK{cik}.json',
    fields: ['revenue', 'net_income', 'eps'],
    latency: '1-7 days after earnings',
    cost: 'free'
  },
  insider_trading: {
    provider: 'SEC Form 4',
    api: 'https://www.sec.gov/cgi-bin/browse-edgar',
    fields: ['transaction_date', 'shares', 'price'],
    latency: '2 business days',
    cost: 'free'
  }
};
```

---

### 3.3 Resolution Rules Template

#### Agenda 생성 시 자동 생성

```typescript
interface ResolutionRules {
  // 기본 정보
  agenda_id: string;
  title: string;
  question: string;

  // Resolution 방법
  resolution_type: 'automatic' | 'community' | 'hybrid' | 'manual';
  resolution_method: string;  // 상세 설명

  // Timeline
  closing_date: Date;
  resolution_date: Date;
  settlement_delay_hours: number;

  // Data Source (automatic인 경우)
  data_source?: {
    provider: string;
    url: string;
    api_endpoint?: string;
    verification_method: string;
  };

  // Criteria (automatic인 경우)
  resolution_criteria?: {
    description: string;
    field: string;
    operator: string;
    threshold: number;
    example: string;
  };

  // Community voting (community인 경우)
  community_rules?: {
    voting_period_days: number;
    consensus_threshold: number;
    minimum_voters: number;
    trust_score_weighted: boolean;
  };

  // Dispute handling
  challenge_allowed: boolean;
  challenge_bond: number;
  challenge_period_hours: number;
  appeal_allowed: boolean;
  appeal_fee: number;

  // Edge cases
  edge_cases: string[];
  ambiguity_resolution: string;
}

// 예시: Tesla Revenue Agenda
const exampleRules: ResolutionRules = {
  agenda_id: "tesla-2025-revenue",
  title: "Tesla 2025 Annual Revenue > $120B",
  question: "Did Tesla's 2025 total annual revenue exceed $120 billion?",

  resolution_type: "automatic",
  resolution_method: "Official SEC 10-K filing data",

  closing_date: new Date("2026-01-31"),
  resolution_date: new Date("2026-02-15"),
  settlement_delay_hours: 3,

  data_source: {
    provider: "SEC EDGAR",
    url: "https://www.sec.gov/edgar/browse/?CIK=1318605",
    api_endpoint: "https://data.sec.gov/submissions/CIK0001318605.json",
    verification_method: "10-K Annual Report 'Total Revenues' line item"
  },

  resolution_criteria: {
    description: "Total annual revenue as reported in 10-K",
    field: "revenues.total",
    operator: ">",
    threshold: 120000000000,
    example: "If 10-K shows $125B, resolves to YES"
  },

  challenge_allowed: true,
  challenge_bond: 100,
  challenge_period_hours: 48,
  appeal_allowed: true,
  appeal_fee: 50,

  edge_cases: [
    "If 10-K is delayed beyond March 1, resolution extends 30 days",
    "Restatements within 90 days will trigger re-resolution",
    "Currency conversion uses USD as of fiscal year end"
  ],
  ambiguity_resolution: "If any ambiguity, escalate to Expert Panel"
};
```

---

## Part 4: 보상 분배 (Settlement)

### 4.1 보상 계산

#### Prediction Market (Real Money)

```typescript
// Kalshi 스타일: Binary contracts ($1 if correct)
interface PredictionBet {
  user_id: string;
  position: 'yes' | 'no';
  shares: number;
  avg_price: number;  // $0.30 - $0.70 (시장 가격)
}

function calculatePayout(bet: PredictionBet, resolution: 'yes' | 'no'): number {
  if (bet.position === resolution) {
    // 맞춤: $1/share
    return bet.shares * 1.00;
  } else {
    // 틀림: $0
    return 0;
  }
}

// 예시:
// Alice: 100 shares YES @ $0.62 = $62 투자
// Resolution: YES
// Payout: 100 × $1.00 = $100
// Profit: $38 (+61%)
```

#### Point-based Game

```typescript
interface PointBet {
  user_id: string;
  points_wagered: number;
  position: 'yes' | 'no';
  confidence: number;  // 0.5 - 1.0
}

function calculatePointReward(bet: PointBet, resolution: 'yes' | 'no'): number {
  if (bet.position === resolution) {
    // 맞춤: 포인트 × (1 + confidence)
    return bet.points_wagered * (1 + bet.confidence);
  } else {
    // 틀림: 포인트 손실
    return 0;
  }
}

// 예시:
// Bob: 1000P on YES with 0.8 confidence
// Resolution: YES
// Reward: 1000 × (1 + 0.8) = 1800P
// Profit: +800P
```

### 4.2 Accuracy Bonus (정확도 보상)

```typescript
interface AccuracyBonus {
  user_id: string;
  total_predictions: number;
  correct_predictions: number;
  brier_score: number;  // 0-2 (lower is better)
}

function calculateAccuracyReward(bonus: AccuracyBonus, pool: number): number {
  // Top 10% predictors share bonus pool
  const accuracy_rate = bonus.correct_predictions / bonus.total_predictions;

  if (accuracy_rate >= 0.8 && bonus.brier_score <= 0.3) {
    // 상위 10% 추정
    return pool * (1 - bonus.brier_score / 2);  // 0.15-0.50 of pool
  }

  return 0;
}
```

### 4.3 Contribution Reward (기여 보상)

```typescript
// Evidence 제출자 보상
interface ContributionReward {
  user_id: string;
  evidence_submitted: Evidence[];
  upvotes: number;
  resolution_contribution: number;  // 0-1
}

function calculateContributionReward(reward: ContributionReward, pool: number): number {
  // Evidence 품질에 따라 보상
  const quality_score = reward.upvotes / (reward.upvotes + 10);  // 0-1
  const contribution_multiplier = reward.resolution_contribution;

  return pool * quality_score * contribution_multiplier;
}
```

---

## Part 5: 구현 우선순위

### MVP (Week 3-6): Type 1만 구현

```
✅ Automatic Resolution (API-based)
- Financial data (stocks, crypto)
- Simple data sources only
- No disputes/appeals

Timeline:
- Resolution within 24h
- Settlement within 3h
```

### Phase 2 (Week 7-12): Type 2 추가

```
✅ Community Resolution
- Trust Score weighted voting
- 3-7 day voting period
- Basic challenge mechanism

Timeline:
- Resolution within 7 days
- Challenge period: 48h
```

### Phase 3 (Month 3-6): Type 3 + Full System

```
✅ Hybrid Resolution
✅ Expert Panel
✅ Appeal Process
✅ Full dispute resolution

Timeline:
- All resolution types supported
- Complete dispute handling
```

---

## Part 6: 주요 과제 및 해결책

### 과제 1: Oracle Problem (믿을 수 있는 데이터 소스)

**문제**: API 데이터도 틀릴 수 있음

**해결책**:
- Multiple sources (2-3개 API 비교)
- Community backup (API 실패 시)
- Challenge mechanism (잘못된 resolution 수정)

### 과제 2: Ambiguity (애매한 질문)

**문제**: "Significantly better"의 기준은?

**해결책**:
- Agenda 생성 시 명확한 기준 명시 강제
- Edge cases 사전 정의
- Expert Panel fallback

### 과제 3: Data Latency (데이터 지연)

**문제**: 정부 통계는 1개월 지연

**해결책**:
- Resolution Date를 충분히 여유있게
- Preliminary resolution → Final resolution
- 사용자에게 예상 timeline 명시

### 과제 4: Sybil Attack (가짜 계정)

**문제**: 한 사람이 여러 계정으로 community vote 조작

**해결책**:
- Trust Score 가중치 (신규 계정은 낮음)
- Vote 참여에 최소 요건 (10+ 투표 이력)
- KYC for real money bets

---

## Appendix A: Kalshi vs Factagora

| 항목 | Kalshi | Factagora (제안) |
|------|--------|------------------|
| **Primary Method** | Automatic (API) | Hybrid (API + Community) |
| **Data Sources** | Government, Financial APIs | Same + Community consensus |
| **Resolution Time** | 1-12 hours | 1 hour - 7 days |
| **Dispute** | Contact support | Challenge + Appeal (on-platform) |
| **Subjective Questions** | Not allowed | Allowed (community vote) |
| **Cost** | Low (API only) | Medium (API + community incentives) |

---

## Appendix B: Resolution Rules 예시

### Example 1: Stock Price

```yaml
Agenda: "Apple stock closes above $200 on March 1, 2026"

Resolution Type: Automatic
Data Source:
  Provider: Yahoo Finance
  API: https://query1.finance.yahoo.com/v8/finance/chart/AAPL
  Field: regularMarketPrice
  Verification: Closing price on March 1, 2026

Criteria:
  - Field: close
  - Operator: >
  - Threshold: 200.00
  - Currency: USD

Timeline:
  - Closing Date: 2026-03-01 16:00 EST (market close)
  - Resolution: 2026-03-01 16:15 EST (15min after close)
  - Settlement: 2026-03-01 19:00 EST (3h after resolution)

Edge Cases:
  - If market closed (holiday): Use next trading day
  - If stock split: Adjust threshold proportionally
  - If trading halted: Extend resolution 24h
```

### Example 2: Subjective Quality

```yaml
Agenda: "GPT-5 is significantly better than GPT-4"

Resolution Type: Community
Method: Trust Score weighted voting

Criteria:
  - "Significantly better" defined as:
    1. 20%+ improvement on major benchmarks (MMLU, HumanEval)
    2. Noticeable quality improvement in user testing
    3. Industry expert consensus

Timeline:
  - Closing Date: 2026-06-30 (3 months after GPT-5 release)
  - Community Vote: 2026-07-01 to 2026-07-07 (7 days)
  - Resolution: 2026-07-08 (if consensus ≥67%)
  - Escalation: Expert Panel (if consensus <67%)
  - Settlement: 2026-07-15 (최대)

Community Voting:
  - Minimum voters: 100
  - Consensus threshold: 67%
  - Trust Score weighted: Yes
  - Minimum Trust Score: 1.0

Expert Panel (if needed):
  - Panel size: 5 AI researchers
  - Review period: 7 days
  - Final decision: Majority vote
```

---

**End of Document**

Sources:
- [Market Rules | Kalshi Help Center](https://help.kalshi.com/markets/markets-101/market-rules)
- [Market Outcomes | Kalshi Help Center](https://help.kalshi.com/markets/markets-101/market-outcomes)
- [Kalshi API Documentation](https://docs.kalshi.com/api-reference/market/get-series)
- [How Are Markets Resolved? - Polymarket](https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-resolved)
- [Metaculus and Markets: What's the Difference?](https://www.metaculus.com/notebooks/38198/metaculus-and-markets-whats-the-difference/)
