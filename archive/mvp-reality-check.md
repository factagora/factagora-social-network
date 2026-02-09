# Factagora MVP Reality Check

> **Version**: 1.0.0
> **Date**: 2026-02-07
> **Perspective**: Lean Startup Methodology & Pragmatic Engineering
> **Status**: Review Ready

---

## 1. Executive Reality Assessment

### Verdict: 현재 계획은 과도하게 설계되었다 (Over-Engineered)

44주(약 11개월) 로드맵에 8개 Phase, 시점별로 3~6명의 팀이 필요한 이 계획은 **Series A 이후 스타트업의 v2.0 제품 계획**에 가깝다. 아직 **핵심 가설이 검증되지 않은 상태**에서 이 규모의 개발은 다음과 같은 위험을 내포한다:

| 측면 | 현재 계획 | 현실적 평가 |
|------|-----------|-------------|
| **개발 기간** | 44주 (11개월) | 시장이 기다려주지 않음. 6개월 후 유사 서비스 등장 가능 |
| **팀 규모** | Phase별 2~6명 (누적 ~8명) | 초기 스타트업에서 이 인력은 비현실적 |
| **기술 스택** | PostgreSQL + TimescaleDB + Redis + K8s | MVP에는 과도. PostgreSQL 하나로 시작 가능 |
| **기능 범위** | 7개 Tier, 4-signal 거버넌스, 6종 AI 에이전트 | 학습 비용만으로 유저 이탈 가능 |
| **핵심 가설 검증** | Phase 7 (33주 후) | **33주를 기다려야 유저를 만남** -- 치명적 |

### 핵심 질문: "사람들이 AI 보조 팩트체크 플랫폼에 참여할 동기가 있는가?"

이 질문에 답하기 전에 44주를 투자하는 것은 린 스타트업 원칙에 정면으로 위배된다.

---

## 2. 핵심 위험 요소 Top 3

### Risk #1: 닭과 달걀 문제 (Cold Start Problem) -- 치명적

**문제**: Factagora는 **네트워크 효과에 극도로 의존**하는 플랫폼이다.
- 참여자가 없으면 Agenda에 투표할 사람이 없다
- 투표가 없으면 Conclusion이 의미가 없다
- Conclusion이 무의미하면 새 유저가 올 이유가 없다
- Trust Score는 50+ Agenda 참여 후에야 의미 있어짐 -- **누가 그만큼 기다리는가?**

**현재 계획의 치명적 결함**: Product spec에 Cold Start 전략이 **전혀 없다**. 첫 100명의 유저를 어떻게 모으고, 첫 10개의 Agenda를 어떻게 활성화할 것인지에 대한 계획이 부재하다.

**권장 해결책**:
- Seed Content: 론칭 전 50+ Agenda를 팀이 직접 생성하고 AI 에이전트로 분석 완료
- 특정 니치 커뮤니티(예: 크립토 예측, AI 규제)에서 시작
- 초기에는 AI가 "유령 참여자" 역할을 해서 플랫폼이 비어보이지 않도록 (단, 투명하게)

### Risk #2: AI 프롬프트 인젝션 & 신뢰성 -- 높음

**문제**: 6-layer 방어 시스템을 설계했지만, 이를 실제로 구현하고 테스트하는 것은 **별도의 보안 팀이 필요한 수준**의 작업이다.

**구체적 위험**:
- 악의적 유저가 Evidence에 프롬프트 인젝션을 삽입해서 AI 에이전트의 분석을 왜곡
- Multi-model consensus는 이론적으로 좋지만, API 비용이 2~3배 증가
- AI hallucination이 잘못된 Evidence verification을 하면 플랫폼 신뢰도 자체가 무너짐
- Moltbook의 실패 사례가 이미 존재: 한 번의 프롬프트 인젝션 사건이 전체 플랫폼 신뢰를 훼손

**권장 해결책**:
- MVP에서는 AI 에이전트를 **읽기 전용 어시스턴트**로만 사용 (자동 분석 X)
- 사용자가 "AI에게 분석 요청" 버튼을 누르면 on-demand로 실행
- Multi-model consensus는 Phase 2 이후로 미룸
- 기본 입력 sanitization + output validation만 구현

### Risk #3: 거버넌스 복잡도 -> 유저 혼란 -- 높음

**문제**: 4-signal 가중치 합산 (Evidence 40% + Vote 35% + AI 15% + Expert 10%)과 7-tier 권한 시스템은 **학문적으로는 훌륭하지만 일반 사용자에게 진입장벽이 너무 높다**.

**비교**:
- Reddit: upvote/downvote -- 직관적
- Kalshi: 확률 예측 -- 직관적
- Wikipedia: edit + citation -- 약간 복잡하지만 학습 가능
- Factagora: 4-signal weighted consensus + 7-tier authority + trust decay + domain expertise... -- **혼란**

**권장 해결책**:
- MVP에서는 **단순 다수결 + Evidence 제출**만 구현
- Trust Score는 있되 **표시만** (가중치 적용은 Phase 2)
- 7 Tier -> **3 Tier로 단순화** (Observer, Participant, Moderator)
- "앞으로 이렇게 정교해질 것이다"는 로드맵으로 소통

---

## 3. MVP 스코프 제안 (단계별)

### 3.1 Week 0-2: Smoke Test (코드 없이 검증)

**목적**: 시장 수요 확인 -- 코드 한 줄 없이 핵심 가설 검증

| 활동 | 도구 | 검증 대상 |
|------|------|-----------|
| 랜딩 페이지 제작 | Framer / Carrd | "AI 팩트체크 플랫폼에 관심 있는 사람이 있는가?" |
| 이메일 대기자 수집 | Waitlist.email | 얼마나 많은 사람이 사전 등록하는가? |
| Notion/Airtable 프로토타입 | Notion DB + 수동 운영 | 팩트체크 "게임"을 사람들이 즐기는가? |
| 커뮤니티 테스트 | Discord/Reddit에 수동 Agenda 운영 | 참여율, 토론 품질, 반복 방문율 |
| 경쟁사 분석 | Community Notes, Metaculus, Polymarket | 차별점이 실제로 존재하는가? |

**Success Criteria**:
- 랜딩페이지 전환율 > 5% (이메일 등록)
- 대기자 500명+ (2주 내)
- Discord에서 수동 Agenda 운영 시 참여자 50명+ 재방문율 30%+

**이 단계를 건너뛰면**: 44주 후에 "아무도 원하지 않는 완벽한 제품"이 될 위험

### 3.2 Week 3-6: True MVP (4주 개발)

**목적**: 최소 기능으로 핵심 루프 검증 -- "Agenda 생성 -> Evidence 제출 -> 투표 -> 결론"

| 포함 (Must Have) | 제외 (Phase 2+) |
|---|---|
| 이메일/Google OAuth 로그인 | Apple/GitHub OAuth |
| Fact Verification Agenda만 | Future Prediction |
| 단순 투표 (True/False/Uncertain) | 가중치 투표 |
| Evidence 제출 (URL + 설명) | AI 자동 검증 |
| 단순 다수결 Conclusion | 4-signal weighted consensus |
| 기본 Agenda 카드 피드 | Kalshi 스타일 시계열 차트 |
| 기본 프로필 (이름, 참여 수) | Trust Score, 7 Tier, 뱃지 |
| 1개의 기본 커뮤니티 (a/general) | 멀티 Agora, 커뮤니티 생성 |
| 기본 반응형 웹 | 네이티브 앱, 고급 모바일 UX |
| AI "분석 요청" 버튼 (on-demand) | 6종 자율 AI 에이전트 |

**기술 스택 (최소화)**:

| 레이어 | 선택 | 이유 |
|--------|------|------|
| Frontend | Next.js 14 (App Router) | SSR, 라우팅 내장, 빠른 개발 |
| Backend | Next.js API Routes | 별도 백엔드 불필요, 빠른 이터레이션 |
| DB | PostgreSQL (Supabase) | Auth 내장, Realtime 내장, 호스팅 무료 시작 |
| Auth | Supabase Auth | OAuth 설정 간편, Row Level Security |
| AI | OpenAI API (GPT-4o) | On-demand 분석, multi-model은 나중에 |
| 배포 | Vercel | Next.js 최적 호스팅, 무료 시작 |
| Realtime | Supabase Realtime | WebSocket 직접 구현 불필요 |

**팀**: 풀스택 개발자 1명 (+ 디자이너 파트타임)

**4주 스프린트 계획**:

```
Week 3: Auth + DB 스키마 + Agenda CRUD + 기본 피드 UI
Week 4: Evidence 제출 + 투표 시스템 + Conclusion 계산
Week 5: 프로필 + AI on-demand 분석 + 기본 알림
Week 6: 모바일 반응형 + 버그 수정 + Seed Content 생성
```

**Success Criteria**:
- 첫 50명 실제 사용자 확보 (대기자 목록에서)
- 10+ Agenda 생성됨
- 평균 5+ 투표/Agenda
- 재방문율 > 20% (D7)
- NPS > 30

### 3.3 Week 7-14: Enhanced MVP (8주 확장)

**MVP 검증이 성공했을 때만 진행**

| 기능 | 우선순위 | 이유 |
|------|----------|------|
| Trust Score (표시 + 기본 가중치) | Must | 플랫폼 차별화 핵심 |
| Future Prediction Agenda | Must | Kalshi 스타일의 핵심 기능 |
| 기본 시계열 차트 (Sparkline) | Must | 시각적 차별점 |
| Agora 멀티 커뮤니티 | Should | 성장 시 커뮤니티 분리 필요 |
| Evidence 강도 점수 (기본) | Should | 품질 차별화 |
| AI 자동 분석 (Fact Checker 1종) | Should | 자동화의 시작 |
| WebSocket 실시간 업데이트 | Should | UX 향상 |
| Discussion 댓글 (1단계 스레드) | Should | 토론 기능 |
| 이메일 알림 | Could | 리텐션 향상 |
| Sub-Agenda | Could | 복잡 Agenda용 |

**추가 기술 스택**:
- 차트: Recharts (간단) 또는 Tremor (미리 스타일링된 차트)
- 시계열 데이터: PostgreSQL 테이블 + 간단한 cron job (TimescaleDB 미도입)

---

## 4. Must / Should / Could 기능 분류

### Must Have (MVP에 필수 -- 핵심 가치 검증)

| 기능 | 원래 Phase | 이유 |
|------|-----------|------|
| 사용자 인증 (Email + Google) | Phase 1 | 기본 |
| Fact Verification Agenda 생성 | Phase 1 | 핵심 기능 |
| 투표 (True/False/Uncertain) | Phase 1 | 핵심 루프 |
| Evidence 제출 (URL + 텍스트) | Phase 1 | 핵심 차별점 |
| 단순 Conclusion 계산 | Phase 1 | 핵심 결과물 |
| Agenda 피드 (카드 리스트) | Phase 1 | 디스커버리 |
| Agenda 상세 페이지 | Phase 1 | 상세 보기 |
| 기본 프로필 | Phase 1 | 아이덴티티 |
| AI On-Demand 분석 | Phase 4 축소 | 앞당겨서 간단히 구현 |
| 모바일 반응형 | Phase 5 축소 | 기본 접근성 |

### Should Have (검증 후 Phase 2 -- 성장 동력)

| 기능 | 원래 Phase | 이유 |
|------|-----------|------|
| Trust Score 표시 + 기본 가중치 | Phase 2 | 플랫폼 차별화 |
| Future Prediction Agenda | Phase 5 | 두 번째 핵심 기능 |
| 시계열 Sparkline 차트 | Phase 3 축소 | Kalshi 영감의 핵심 |
| Agora 멀티 커뮨니티 | Phase 1 | 확장성 |
| Evidence 강도 점수 | Phase 2 | 품질 차별화 |
| 기본 AI 자동 분석 (1종) | Phase 4 축소 | 자동화 시작 |
| 실시간 업데이트 | Phase 3 | UX 향상 |
| 기본 댓글/토론 | Phase 5 | 참여 증대 |
| 3-Tier 권한 (Observer/Participant/Mod) | Phase 2 축소 | 기본 거버넌스 |
| Agenda Lifecycle (Open -> Deliberation -> Concluded) | Phase 1 확장 | 구조적 토론 |

### Could Have (Phase 3+ -- 성숙 단계)

| 기능 | 원래 Phase | 이유 |
|------|-----------|------|
| 4-Signal Weighted Consensus | Phase 2 | 복잡도 높음, 유저 이해 어려움 |
| 7-Tier 권한 시스템 | Phase 2 | 3-Tier로 충분히 시작 가능 |
| 6종 AI 에이전트 (자율 방문) | Phase 4 | 운영 복잡도 극심 |
| TimescaleDB 통합 | Phase 3 | PostgreSQL로 시작 가능 |
| Sub-Agenda 시스템 | Phase 5 | 사용 빈도 낮을 것으로 예상 |
| Appeal 프로세스 | Phase 5 | 초기에는 수동 운영 가능 |
| Expert Panel 시스템 | Phase 5 | 전문가 확보 후 구현 |
| Multi-Model Consensus | Phase 4 | 비용 대비 효과 불확실 |
| 프롬프트 인젝션 6-Layer 방어 | Phase 6 | 기본 방어만으로 시작 |
| Kubernetes 배포 | Phase 6 | Vercel/Railway로 충분 |
| Sankey 다이어그램 | Phase 3 | 시각화 Nice-to-have |
| Calibration 차트 | Phase 3 | 데이터 축적 후 의미 |
| 리더보드 | Phase 5 | 성장 후 |
| 알림 시스템 (In-app) | Phase 5 | 이메일로 시작 가능 |
| GDPR/CCPA 준수 | Phase 6 | 스케일 이후 |

### Won't Have (재고 필요)

| 기능 | 이유 |
|------|------|
| 블록체인 통합 | 불필요한 복잡도 |
| 네이티브 모바일 앱 | PWA로 충분 |
| Federation Protocol | 시장 검증 후 |
| API Marketplace | 수익화는 나중에 |
| Gamification | 핵심 가치 명확해진 후 |

---

## 5. 수정된 Phase 1 로드맵 (간소화)

### 새로운 3-Phase 접근법

```
Phase 0: Validate (Week 0-2)  -- 코드 없이 검증
Phase 1: Build MVP (Week 3-6) -- 4주 빌드
Phase 2: Learn & Iterate (Week 7-14) -- 학습 기반 확장
```

총 14주 (3.5개월) 안에 검증된 제품을 가질 수 있다. 이는 원래 계획의 Phase 1 완료 시점 (8주)보다 빠르다.

### Phase 0: Validate (Week 0-2)

| Week | 활동 | 산출물 |
|------|------|--------|
| Week 1 | 랜딩페이지 제작 + 대기자 수집 시작 | 랜딩페이지 live |
| Week 1 | Discord 커뮤니티 생성 + 수동 Agenda 운영 시작 | 10+ 수동 Agenda |
| Week 2 | 경쟁사 분석 (Community Notes, Metaculus, Polymarket) | 경쟁 분석 보고서 |
| Week 2 | 초기 유저 인터뷰 (10명+) | 인사이트 문서 |

**Go/No-Go 기준**: 대기자 200명+ AND Discord 활성 유저 30명+

### Phase 1: Build MVP (Week 3-6)

**핵심 원칙**: "학습할 수 있는 최소한의 것을 만든다"

```
Week 3: Foundation
├── Next.js 프로젝트 생성
├── Supabase 셋업 (Auth + DB)
├── DB 스키마: users, agendas, votes, evidence (4 테이블)
├── Auth: Email + Google OAuth
├── Agenda CRUD API
└── 기본 피드 UI (Agenda 카드 리스트)

Week 4: Core Loop
├── Evidence 제출 기능
├── 투표 시스템 (True/False/Uncertain)
├── Conclusion 계산 (단순 가중 다수결)
├── Agenda 상세 페이지 (Evidence 리스트 + 투표 현황)
└── 기본 검색 + 필터

Week 5: AI & Polish
├── AI "분석 요청" 버튼 (GPT-4o API 호출)
├── AI 분석 결과 표시 (Evidence 탭에 삽입)
├── 기본 프로필 페이지
├── 기본 이메일 알림 (Agenda 상태 변경)
└── 에러 핸들링 + 입력 검증

Week 6: Launch Prep
├── 모바일 반응형 완성
├── Seed Content: 20+ Agenda 생성 + AI 분석
├── 대기자에게 초대 이메일
├── 버그 수정 + 성능 최적화
└── Analytics 설정 (PostHog/Mixpanel)
```

**아키텍처 (극도로 단순화)**:

```
┌──────────────────┐
│   Next.js App    │  (Vercel)
│  ├── Pages/UI    │
│  ├── API Routes  │
│  └── Server Actions│
└────────┬─────────┘
         │
    ┌────┴────┐
    │ Supabase │  (Free tier)
    │ ├── Auth │
    │ ├── DB   │  (PostgreSQL)
    │ └── RT   │  (Realtime)
    └────┬────┘
         │
    ┌────┴────┐
    │ OpenAI  │  (On-demand)
    │ GPT-4o  │
    └─────────┘
```

**DB 스키마 (최소화 -- 4+2 테이블)**:

```sql
-- Supabase auth.users 테이블 활용 (별도 users 테이블 불필요)

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  participation_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  agenda_type TEXT DEFAULT 'fact_verification',
  status TEXT DEFAULT 'open',  -- open, deliberation, concluded
  conclusion_label TEXT,       -- true, false, uncertain
  conclusion_score DECIMAL(5,2),
  evidence_count INT DEFAULT 0,
  vote_count INT DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  concluded_at TIMESTAMPTZ
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID REFERENCES agendas(id),
  user_id UUID REFERENCES profiles(id),
  position TEXT NOT NULL,  -- true, false, uncertain
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agenda_id, user_id)  -- 1인 1투표 (업데이트 가능)
);

CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID REFERENCES agendas(id),
  submitted_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  source_url TEXT,
  content TEXT,
  position TEXT,  -- supporting, opposing, contextual
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI 분석 결과 (Evidence 테이블에 is_ai_generated=true로 저장하거나 별도 테이블)
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID REFERENCES agendas(id),
  analysis_text TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 시계열은 나중에. 일단 votes + evidence의 created_at으로 시간 추적
```

### Phase 2: Learn & Iterate (Week 7-14)

**데이터 기반 의사결정**: Phase 1의 사용자 행동 데이터를 분석하여 다음 기능을 결정

```
Week 7-8: 사용자 피드백 분석 + 우선순위 재조정
├── 사용자 인터뷰 (기존 유저 10명+)
├── 행동 데이터 분석 (어디서 이탈하는가?)
├── 가장 많이 요청된 기능 파악
└── Phase 2 스프린트 계획 수립

Week 9-10: 핵심 기능 확장 (데이터 기반 선택)
├── [만약 예측 기능 요청 높으면] Future Prediction Agenda
├── [만약 시각화 요청 높으면] 기본 시계열 차트
├── [만약 커뮤니티 요청 높으면] Agora 멀티 커뮤니티
├── Trust Score 표시 (투표 가중치 미적용)
└── 기본 AI 자동 분석 (하루 1회)

Week 11-12: 품질 & 리텐션
├── Evidence 강도 점수 (기본)
├── Agenda Lifecycle 강화 (Deliberation 기간 추가)
├── 기본 댓글/토론 기능
├── 푸시 알림 / 이메일 다이제스트
└── 성능 최적화

Week 13-14: 스케일 준비
├── [수요에 따라] 실시간 업데이트 (Supabase Realtime)
├── 3-Tier 권한 (Observer/Participant/Moderator)
├── 기본 콘텐츠 모더레이션
├── 부하 테스트
└── 다음 단계 로드맵 수립
```

---

## 6. 기술 스택 간소화 제안

### 현재 계획 vs 간소화 제안

| 레이어 | 현재 계획 | 간소화 제안 | 이유 |
|--------|-----------|-------------|------|
| **Frontend** | React + Zustand + React Router + Vite | **Next.js 14** (App Router) | 라우팅, SSR, API 통합 |
| **Backend** | Fastify (or Go) 별도 서비스 | **Next.js API Routes** | 별도 서버 불필요 |
| **DB** | PostgreSQL + TimescaleDB + Redis | **Supabase (PostgreSQL)** | 1개 DB로 시작 |
| **Auth** | JWT 직접 구현 + OAuth | **Supabase Auth** | 즉시 사용 가능 |
| **Realtime** | Socket.IO + Redis Pub/Sub | **Supabase Realtime** | 인프라 관리 불필요 |
| **Task Queue** | BullMQ + Redis | **Vercel Cron + Edge Functions** | 간단한 스케줄링 |
| **AI** | Multi-model + 6종 에이전트 | **OpenAI GPT-4o** (1종, on-demand) | 복잡도 대폭 감소 |
| **배포** | Docker + Kubernetes | **Vercel** | 제로 설정 배포 |
| **모니터링** | Prometheus + Grafana + Loki | **PostHog + Sentry** | 무료 시작, 빠른 설정 |
| **검색** | PostgreSQL FTS -> Elasticsearch | **PostgreSQL FTS** | 충분함 |

### 비용 비교 (월간, MVP 단계)

| 항목 | 현재 계획 (K8s 기반) | 간소화 (Managed) |
|------|---------------------|-----------------|
| 호스팅 | $200~500/월 (AWS/GCP K8s) | $0~20/월 (Vercel Free/Pro) |
| DB | $50~100/월 (RDS + TimescaleDB) | $0~25/월 (Supabase Free/Pro) |
| Redis | $15~50/월 | $0 (불필요) |
| AI API | $100~300/월 (Multi-model) | $20~50/월 (On-demand GPT-4o) |
| 모니터링 | $50~100/월 | $0 (PostHog free) |
| **Total** | **$415~1,050/월** | **$20~95/월** |

### 스케일 마이그레이션 경로

간소화 스택으로 시작하더라도, 사용자 증가 시 점진적으로 마이그레이션 가능:

```
1,000 MAU: Supabase Pro ($25/월) -- 충분
10,000 MAU: Supabase Pro + Vercel Pro ($45/월) -- 충분
50,000 MAU: 별도 PostgreSQL + Redis 도입 검토
100,000 MAU: TimescaleDB, BullMQ, K8s 검토
500,000+ MAU: 현재 계획의 풀 아키텍처 필요
```

**핵심**: 500,000 MAU에 도달하는 스타트업은 극소수다. 그 시점까지 기다려도 된다.

---

## 7. TimescaleDB 도입 타당성 분석

### 판단: MVP에서 불필요. PostgreSQL만으로 시작하라.

**현재 계획의 TimescaleDB 사용 사례**:
1. AgendaSnapshot (15분/시간/6시간/일별) 저장
2. ConclusionSnapshot 저장
3. Continuous Aggregates (자동 롤업)

**PostgreSQL만으로 대체 가능한 이유**:

| 기능 | TimescaleDB | PostgreSQL 대안 |
|------|-------------|-----------------|
| 시계열 저장 | Hypertable | 일반 테이블 + created_at 인덱스 |
| 자동 롤업 | Continuous Aggregates | Cron job + materialized view |
| 데이터 보존 | Retention policy | 수동 DELETE + VACUUM |
| 압축 | Native compression | pg_partman으로 파티셔닝 |

**TimescaleDB가 필요해지는 시점**:
- 일일 스냅샷 100,000건+ (대략 2,000+ 활성 Agenda)
- 시계열 쿼리 응답 시간이 500ms 초과
- 실시간 연속 집계가 성능 병목

**MVP에서의 현실**:
- 초기 Agenda 수: 20~100개
- 스냅샷: 일 100~500건
- PostgreSQL의 인덱싱만으로 ms 단위 응답 가능

### 대안: 간단한 시계열 접근법

```sql
-- votes 테이블의 created_at을 기반으로 시계열 추출
-- 별도 스냅샷 테이블 불필요 (MVP)

-- 일별 Conclusion 추이 쿼리
SELECT
  DATE_TRUNC('day', v.created_at) as day,
  COUNT(*) FILTER (WHERE v.position = 'true') * 100.0 / COUNT(*) as true_pct,
  COUNT(*) as total_votes
FROM votes v
WHERE v.agenda_id = $1
GROUP BY DATE_TRUNC('day', v.created_at)
ORDER BY day;
```

Phase 2에서 필요하면 별도 `agenda_snapshots` 테이블을 **일반 PostgreSQL 테이블**로 추가:

```sql
CREATE TABLE agenda_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID REFERENCES agendas(id),
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  conclusion_score DECIMAL(5,2),
  vote_count INT,
  evidence_count INT,
  participant_count INT
);

CREATE INDEX idx_snapshots_agenda_time
  ON agenda_snapshots (agenda_id, snapshot_at DESC);

-- Cron job (Vercel Cron 또는 pg_cron)으로 1시간마다 스냅샷 생성
```

---

## 8. 7-Tier 권한 시스템 간소화

### 현재: 7-Tier (과도)

```
Tier 1: Observer       -- 읽기만
Tier 2: Participant    -- 투표, 댓글
Tier 3: Contributor    -- Evidence 제출, Agenda 생성
Tier 4: Reviewer       -- Evidence 리뷰, 토론 모더레이션
Tier 5: Expert         -- 가중 투표, 전문가 패널
Tier 6: Governor       -- 커뮤니티 거버넌스
Tier 7: Arbiter        -- 플랫폼 레벨 결정
```

### MVP 제안: 3-Tier

```
Level 1: Member        -- 가입 즉시. 읽기 + 투표 + 댓글
Level 2: Contributor   -- 3+ 투표 후. Evidence 제출 + Agenda 생성
Level 3: Moderator     -- 관리자 지정. 콘텐츠 관리 + Agenda 상태 변경
```

**장점**:
- 가입 즉시 핵심 기능(투표) 사용 가능 -- 진입 장벽 최소화
- 스팸 방지를 위한 최소한의 게이트만 (Evidence/Agenda 생성에 3회 투표 필요)
- 복잡한 Authority Tier 로직 구현 불필요
- 사용자가 이해하기 쉬움

**마이그레이션 경로**: 커뮤니티가 성장하면 Tier를 점진적으로 추가 (3 -> 5 -> 7)

---

## 9. 거버넌스 간소화

### 현재: 4-Signal Weighted Consensus

```
Conclusion = Evidence(40%) + Votes(35%) + AI(15%) + Expert(10%)
```

### MVP 제안: Simple Majority + Evidence Display

```
Conclusion = Weighted Vote Count (100%)
  where Weight = 1.0 for all users (Phase 1)

+ Evidence는 별도 표시 (투표 참고용)
+ AI 분석은 on-demand 요약으로 표시
```

**왜 이게 충분한가**:
1. **핵심 검증**: "사람들이 팩트체크에 투표하고 싶어하는가?" -- 이것만 알면 된다
2. **Evidence는 이미 표시됨**: 유저가 직접 Evidence를 보고 판단
3. **AI 분석은 보조 도구**: 투표 전에 AI 분석을 참고할 수 있음
4. **가중치는 데이터 축적 후**: Trust Score 기반 가중치는 이력 데이터가 쌓인 후에 의미

### Phase 2 마이그레이션:

```
Phase 2a: Trust Score 표시 (가중치 미적용)
Phase 2b: Trust Score 기반 투표 가중치 (Trust × Vote)
Phase 2c: Evidence Score 통합 (Evidence 40% + Vote 60%)
Phase 3:  AI Verification 통합 (full 4-signal)
```

---

## 10. 2주 안에 테스트할 수 있는 것

### 코드 없이 할 수 있는 검증

| 검증 항목 | 방법 | 소요 시간 | 비용 |
|-----------|------|-----------|------|
| 시장 수요 | 랜딩페이지 + 광고 (Reddit/Twitter) | 3일 | $50~200 |
| 콘텐츠 적합성 | Notion DB로 "팩트체크 게임" 수동 운영 | 5일 | 무료 |
| UX 검증 | Figma 프로토타입 + 유저 테스트 (5명) | 4일 | 무료 |
| 경쟁 차별점 | Community Notes/Metaculus 사용 후 비교 | 2일 | 무료 |
| AI 분석 품질 | ChatGPT/Claude에 수동 팩트체크 요청 | 1일 | 무료 |
| 핵심 플로우 | Discord에서 수동으로 Agenda->Vote->Conclude | 7일 | 무료 |

### 가장 중요한 2주 실험

**실험**: "Discord 팩트체크 챌린지"

```
Day 1-2: Discord 서버 설정 + 초기 멤버 모집 (목표: 50명)
Day 3-7: 매일 1개 Agenda 생성 (팀이 수동으로)
         - 참여자가 리액션으로 투표 (👍/👎/🤔)
         - Evidence를 댓글로 제출
         - AI가 분석 결과를 봇으로 게시
Day 8-14: 참여자가 직접 Agenda 생성 시작
          - 참여율, 재방문율, 토론 품질 측정
          - 유저 인터뷰 5명+
```

**측정 항목**:
- 일일 활성 참여자 (DAP)
- Agenda당 평균 투표 수
- Evidence 제출율 (투표자 중 % )
- 재방문율 (D1, D3, D7)
- NPS (1-10 추천 의향)
- 자발적 Agenda 생성 수

**Go/No-Go**: DAP 20+, 투표율 50%+, D7 재방문 25%+

---

## 11. 요약: 행동 계획

### 즉시 시작 (이번 주)

1. **랜딩 페이지** 제작 + 대기자 수집 시작
2. **Discord 서버** 생성 + "팩트체크 챌린지" 시작
3. **경쟁사 분석** (Community Notes, Metaculus, Polymarket 직접 사용)
4. **유저 인터뷰** 스크립트 준비

### 2주 후 결정

- 대기자 200명+, Discord DAP 20+ -> **MVP 개발 Go** (Phase 1)
- 미달 시 -> 포지셔닝/메시징 변경 후 재시도 또는 Pivot 검토

### 6주 후 결정

- MVP 50명+ 활성 유저, D7 재방문 20%+ -> **Phase 2 Go**
- 미달 시 -> 피드백 기반 리디자인 또는 Pivot

### 14주 후 결정

- 1,000+ MAU, 유기적 성장 시작 -> **현재 계획의 Phase 3-4 일부 적용**
- 성장 정체 시 -> Growth 전략 재수립

---

## 12. 최종 권고

### 핵심 메시지

> **"44주 계획을 실행하기 전에, 4주 만에 핵심 가설을 검증하라."**

현재 문서들(product-spec, ux-ui-design, system-architecture)은 **기술적으로 잘 설계되어 있다**. 문제는 설계의 품질이 아니라 **타이밍과 순서**다.

### 한 줄 요약

| 현재 | 권장 |
|------|------|
| 44주 후에 완벽한 제품을 출시 | **4주 후에 불완전한 제품으로 학습 시작** |
| 8명 팀으로 풀 스택 구축 | **1-2명으로 MVP 빌드** |
| PostgreSQL + TimescaleDB + Redis + K8s | **Supabase + Vercel** |
| 4-signal consensus + 7 tier | **단순 투표 + 3 tier** |
| 6종 자율 AI 에이전트 | **1종 on-demand AI 분석** |
| Phase 7 (33주)에 첫 유저 | **Week 0 (지금)에 Discord 검증 시작** |

현재 계획서는 "v2.0 청사진"으로 보관하고, 먼저 시장을 검증하라.

---

> *"If you're not embarrassed by the first version of your product, you've launched too late."* -- Reid Hoffman
