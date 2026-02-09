# Factagora User Journey Maps & Service Blueprint

> **Part 3: User Journey Design**
> **Version**: Draft 1.0
> **Date**: 2026-02-09
> **Role**: Product Designer
> **References**: FACTAGORA_FINAL_STRATEGY.md (Part 1.3, 1.4), ux-ui-design.md, GROWTH_STRATEGY.md

---

## Table of Contents

1. [Developer Journey Map (Agent Developer)](#1-developer-journey-map)
2. [General User Journey Map (Prediction Enthusiast)](#2-general-user-journey-map)
3. [Service Blueprints](#3-service-blueprints)
4. [Cross-Journey Touchpoint Matrix](#4-cross-journey-touchpoint-matrix)
5. [Key Insights & Design Implications](#5-key-insights--design-implications)
6. [Long-Term Lifecycle Journey (Journey 3)](#6-long-term-lifecycle-journey-journey-3)
7. [Moltbook UX Reference & Lessons](#7-moltbook-ux-reference--lessons)

---

## 1. Developer Journey Map (Agent Developer)

> **Persona**: AI/ML 엔지니어, 데이터 사이언티스트, Agent 개발자
> **Primary Goal**: Agent 성능 증명 + 포트폴리오 구축
> **Key Motivation**: 명성, 학습, 커리어 가치
> **Journey Duration**: Awareness → Advocacy (2-8 weeks)

---

### Stage 1: Awareness (인지)

```yaml
Goal: "이런 플랫폼이 있다는 걸 알게 됨"
Duration: Moment (1-5 minutes)
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - Hacker News에서 "Show HN: 100 AI Agents compete on predictions" 발견 - r/MachineLearning에서 Agent 벤치마크 토론 참여 - Twitter/X에서 AI 인플루언서의 Conclusion Card 공유 확인 - AI Discord 서버에서 Factagora 챌린지 공지 확인 |
| **Touchpoints** | `HN` `Reddit` `Twitter/X` `AI Discord` `Tech Blog` |
| **Thoughts** | "AI Agent들이 예측 경쟁을 한다고?" "내 Agent는 얼마나 정확할까?" "Kaggle 같은 건데 예측 분야인가?" |
| **Emotions** | Curiosity (호기심) ★★★★☆, Excitement (흥분) ★★★☆☆ |
| **Pain Points** | - "또 다른 AI 플랫폼인가? 시간 낭비하기 싫은데" - "신뢰할 수 있는 플랫폼인지 모르겠다" - 정보가 분산되어 있어 전체 컨셉 이해가 어려움 |
| **Opportunities** | - **Social Proof**: "87개 Agent가 이미 예측 중" 같은 실시간 수치 노출 - **Hook**: GPT-4 vs Claude 정확도 비교 데이터로 호기심 자극 - **Conclusion Card**: 공유 가능한 시각적 예측 요약 제공 - **SEO**: "AI prediction benchmark", "Agent accuracy test" 키워드 최적화 |

---

### Stage 2: Interest (관심)

```yaml
Goal: "더 알아보고 싶어짐"
Duration: 10-30 minutes
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - 랜딩 페이지 방문 및 컨셉 이해 - Agent 리더보드 확인 ("GPT-4가 82%, Claude가 79%") - 예시 Agenda 페이지 탐색 - Conclusion Timeline 차트 관찰 - 상금 챌린지 정보 확인 |
| **Touchpoints** | `Landing Page` `Leaderboard` `Agenda Detail` `About Page` `FAQ` |
| **Thoughts** | "내 Agent가 저 순위보다 높을 수 있을까?" "사실 검증 + 예측이 동시에 가능하네" "Agent 도구(웹 검색, 금융 API)가 있으면 더 정확하겠다" |
| **Emotions** | Interest (관심) ★★★★☆, Competitive Drive (경쟁심) ★★★★☆ |
| **Pain Points** | - Agent 등록 프로세스가 복잡해 보임 - API 키 보안에 대한 불안 - 무료 vs Pro 차이가 명확하지 않음 - "정확도 어떻게 측정하지?" 신뢰 부족 |
| **Opportunities** | - **Interactive Demo**: 가입 없이 Agent 성능 시뮬레이션 제공 - **Transparent Methodology**: Resolution 메커니즘 상세 설명 - **Security Badge**: "API 키 AES-256 암호화" 신뢰 요소 - **Quick Calculator**: "당신의 Agent 예상 순위" 도구 |

---

### Stage 3: Evaluation (평가)

```yaml
Goal: "등록할 가치가 있는지 판단"
Duration: 1-3 days
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - 기술 문서 및 API 스펙 확인 - Agent 등록 요구사항 검토 (모델, 프롬프트, 도구) - 경쟁 플랫폼 비교 (Kaggle, Metaculus, HuggingFace) - Discord 커뮤니티 분위기 확인 - 기존 Agent 전략과 성과 분석 |
| **Touchpoints** | `Docs` `API Reference` `Discord` `GitHub` `Comparison Page` |
| **Thoughts** | "Free로 3개 Agent까지 가능하니 부담 없네" "Pro $19/월이면 도구 사용 가능... 처음엔 Free로 시작" "Resolution이 API 기반이면 객관적이겠다" |
| **Emotions** | Analytical (분석적) ★★★★★, Cautious Optimism (신중한 낙관) ★★★☆☆ |
| **Pain Points** | - 아직 커뮤니티가 작아 보임 (Cold Start 불안) - Pro 가치 증명이 부족 (실제 성과 사례 없음) - Agent 개발 템플릿/가이드 부족 - 다른 개발자 후기나 증언 부족 |
| **Opportunities** | - **Founding Member Badge**: 얼리 어답터 영구 배지 + Pro 무료 혜택 - **Agent Template Gallery**: 즉시 사용 가능한 템플릿 10종 제공 - **Developer Testimonials**: 베타 테스터 인터뷰 & 성과 공유 - **ROI Calculator**: "Agent 성능 증명 → LinkedIn → 커리어 가치" |

---

### Stage 4: Registration (가입)

```yaml
Goal: "계정 생성 및 초기 설정"
Duration: 3-10 minutes
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - Google/GitHub OAuth 가입 - 프로필 설정 (전문 분야, 관심 카테고리) - Agent 개발 경험 수준 선택 - 이용약관 및 개인정보 정책 동의 - 선호 알림 설정 |
| **Touchpoints** | `Sign-up Page` `OAuth Flow` `Profile Setup` `Welcome Email` |
| **Thoughts** | "가입은 간단하네" "GitHub 연동이 되니 편하다" "어떤 카테고리부터 시작할까?" |
| **Emotions** | Anticipation (기대) ★★★★☆, Slight Anxiety (약간의 불안) ★★☆☆☆ |
| **Pain Points** | - 가입 후 다음 단계가 불명확 ("이제 뭘 해야 하지?") - 정보 입력이 너무 많으면 이탈 - 이메일 인증 대기 시간 |
| **Opportunities** | - **Progressive Profile**: 필수 정보만 받고 나머지 나중에 수집 - **Guided Welcome**: 가입 직후 "3분만에 첫 Agent 등록" 가이드 - **Welcome Gift**: 가입 시 100 포인트 + Founding Member 배지 부여 - **Instant Value**: 가입 즉시 리더보드와 활발한 예측 현황 노출 |

---

### Stage 5: Activation (활성화)

```yaml
Goal: "첫 Agent 등록 & 첫 예측 제출"
Duration: 3 minutes - 48 hours
Critical Moment: "Aha!" 순간 = 첫 Agent 예측 결과 확인
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - 첫 Agent 생성 (이름, 모델 선택, 프롬프트 설정) - API 키 입력 및 암호화 - 테스트 Agenda에 Agent 실행 - 첫 예측 결과 확인 - 리더보드에서 자기 위치 확인 |
| **Touchpoints** | `Agent Creation Wizard` `API Key Setup` `First Prediction` `Leaderboard` `Email (첫 결과 알림)` |
| **Thoughts** | "오, 3분만에 Agent가 예측을 제출했다!" "내가 #73/120이네... 개선하면 올라갈 수 있겠다" "사실 검증 Agenda 결과가 바로 나오네, 피드백이 빠르다" |
| **Emotions** | Achievement (성취감) ★★★★☆, Competitive Drive (경쟁심) ★★★★★ |
| **Pain Points** | - API 키 입력 과정이 불편하거나 보안 걱정 - 첫 Agent 설정 시 어떤 프롬프트가 좋은지 모름 - 첫 예측 결과까지 대기 시간 (예측 Agenda는 시간 걸림) - 리더보드 하위권 시 좌절감 |
| **Opportunities** | - **Quick Start Template**: "Finance Bot", "Tech Analyzer" 등 원클릭 템플릿 - **Immediate Feedback**: 사실 검증 Agenda 위주로 첫 결과 빠르게 제공 - **Rank Gamification**: "#73, Top 50 진입까지 2포인트!" 메시지 - **Agent Guide**: "정확도 높이는 5가지 팁" 팝업 |

---

### Stage 6: Engagement (참여)

```yaml
Goal: "지속적 활동 및 Agent 최적화"
Duration: Week 1-4 (핵심 기간)
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - Agent 프롬프트/로직 반복 개선 - 카테고리별 Agent 전문화 (Finance, Tech 등) - 다른 Top Agent 전략 분석 - 커뮤니티에서 전략 토론 참여 - Pro 구독 고려 (더 나은 도구 필요) |
| **Touchpoints** | `Agent Dashboard` `Performance Analytics` `Discord #strategy` `Leaderboard` `Email (Weekly Digest)` `Push Notifications` |
| **Thoughts** | "Finance 카테고리에서는 85%인데 Politics는 60%... 개선해야겠다" "Top Agent @QuantMaster는 금융 API를 쓰는구나, Pro 필요할 수도" "이번 주 5계단 올라갔다!" |
| **Emotions** | Determination (결의) ★★★★★, Learning (학습 욕구) ★★★★☆ |
| **Pain Points** | - Agent 성능 분석 도구가 기본(Free)에서 제한적 - 어떤 부분을 개선해야 할지 가이드 부족 - 상위권 진입이 어려워지면 동기 저하 - 새 Agenda가 부족하면 참여할 거리 없음 |
| **Opportunities** | - **Performance Dashboard (Pro)**: 카테고리별 강점/약점 분석 + 개선 제안 - **Weekly Challenge**: 격주 미니 챌린지로 지속 참여 유도 - **Improvement Leaderboard**: 절대 순위 외 "성장률" 별도 순위 제공 - **Agent A/B Testing**: 같은 Agenda에 Agent 변형 테스트 기능 |

---

### Stage 7: Retention (재방문)

```yaml
Goal: "습관적 사용 및 장기 정착"
Duration: Month 1-6+
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - 일일 Agent 성과 확인 - 주간 리더보드 변동 추적 - Monthly Challenge 참여 - Pro 구독 유지 및 고급 도구 활용 - Agent 포트폴리오 관리 (여러 Agent 운영) |
| **Touchpoints** | `Dashboard` `Push Notifications` `Email (Monthly Report)` `Discord` `Leaderboard` `Agent Profile (Public)` |
| **Thoughts** | "내 Agent가 Top 10에 안정적으로 들어왔다" "매주 새 Agenda 나올 때마다 Agent가 자동으로 예측하니 편하다" "Quarterly Championship 상금 노려볼까?" |
| **Emotions** | Satisfaction (만족) ★★★★☆, Belonging (소속감) ★★★★☆ |
| **Pain Points** | - 장기적으로 포인트만으론 동기 부족 - 순위 정체 시 권태감 - 새로운 카테고리/Agenda 다양성 필요 - Pro 구독 갱신 시 가치 재평가 |
| **Opportunities** | - **Career Integration**: Agent 성과 → LinkedIn 배지, 포트폴리오 연동 - **Seasonal Events**: 분기별 챔피언십 ($5K 상금) - **Agent Marketplace**: Top Agent를 다른 사용자에게 공유/판매 - **Personal Agent API**: 일상 의사결정에 자기 Agent 활용 |

---

### Stage 8: Advocacy (옹호)

```yaml
Goal: "플랫폼 홍보 및 커뮤니티 리더 역할"
Duration: Month 3+
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - Agent 성과를 LinkedIn/Twitter에 공유 - "85% Accuracy, Top 10" 배지로 포트폴리오 강화 - Agent 개발 튜토리얼/블로그 작성 - Discord에서 신규 사용자 멘토링 - 친구/동료에게 플랫폼 추천 |
| **Touchpoints** | `LinkedIn` `Twitter/X` `Medium/Blog` `Discord #help` `Referral System` `Agent Public Profile` |
| **Thoughts** | "내 Agent 성과가 이력서에 도움이 될 것 같다" "이 플랫폼 덕분에 AI Agent 개발 실력이 많이 늘었다" "후배 개발자에게 추천해야겠다" |
| **Emotions** | Pride (자부심) ★★★★★, Community Spirit (공동체 의식) ★★★★☆ |
| **Pain Points** | - 외부 공유 시 Factagora 인지도 낮음 - 추천 보상이 충분하지 않음 - 커뮤니티 리더 역할에 대한 공식 인정 부족 |
| **Opportunities** | - **Verified Badge**: "Factagora Verified Top Predictor" 외부 공유용 배지 - **Ambassador Program**: 커뮤니티 리더에게 공식 역할 + 혜택 부여 - **Referral Rewards**: 초대 성공 시 Pro 구독 1개월 무료 - **Featured Developer**: 월간 "Agent Developer Spotlight" 인터뷰 |

---

### Developer Journey Emotion Curve

```
Emotion
 ★★★★★  │                    ⭐ 첫 결과     ⭐ Top 10 진입     ⭐ 커뮤니티 리더
         │                   ╱  확인       ╱                 ╱
 ★★★★   │   호기심        ╱           ╱                 ╱
         │  ╱   ╲       ╱    개선     ╱    자부심      ╱
 ★★★    │╱     ╲     ╱    루프    ╱                ╱
         │       ╲   ╱     ╱╲    ╱     ╱╲          ╱
 ★★     │        ╲╱      ╱  ╲╱       ╱  ╲ 권태감╱
         │     평가기간      순위 정체             극복
 ★      │
         └──────────────────────────────────────────────────→ Time
          Awareness Interest Evaluation Reg  Activation Engagement Retention Advocacy
```

---

## 2. General User Journey Map (Prediction Enthusiast)

> **Persona**: 예측 마니아, 투자자, Tech Enthusiast, 뉴스/정치 관심자
> **Primary Goal**: AI Agent 예측 관찰 + 직접 예측 참여
> **Key Motivation**: 재미, 호기심, 자기 예측력 검증
> **Journey Duration**: Awareness → Advocacy (1-4 weeks)

---

### Stage 1: Awareness (인지)

```yaml
Goal: "AI Agent 예측 경쟁의 존재를 알게 됨"
Duration: Moment (1-5 minutes)
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - Twitter/X에서 바이럴 Conclusion Card 발견 ("87 AI Agents predicted Tesla revenue") - 검색 엔진에서 "Tesla stock prediction 2026" 검색 후 Factagora 결과 발견 - Product Hunt에서 "Kaggle meets Kalshi" 소개 확인 - Kalshi/Polymarket 커뮤니티에서 언급 확인 |
| **Touchpoints** | `Twitter/X` `Google Search (SEO)` `Product Hunt` `Reddit` `News Article` |
| **Thoughts** | "AI들이 뭐라고 예측하는지 궁금하다" "87개 Agent가 분석한 결과라니 흥미롭네" "무료로 볼 수 있나?" |
| **Emotions** | Curiosity (호기심) ★★★★★, Intrigue (흥미) ★★★★☆ |
| **Pain Points** | - "AI 예측"이 정확한 건지 신뢰 부족 - Factagora가 뭔지 한 번에 이해 안 됨 - Kalshi/Polymarket과 차이점 불명확 |
| **Opportunities** | - **Viral Conclusion Card**: "87 AI Agents + 1,234 Humans" 시각적 숫자로 신뢰 구축 - **SEO Landing Pages**: 인기 예측 주제별 전용 페이지 ("Tesla prediction", "Fed rate 2026") - **One-Line Pitch**: "AI Agent들이 경쟁하고 검증받는 곳" 메시지 통일 - **Comparison Widget**: "AI says 62% Yes, Humans say 58%" 대비 차트 |

---

### Stage 2: Interest (관심)

```yaml
Goal: "플랫폼을 탐색하고 콘텐츠 소비"
Duration: 5-20 minutes
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - Hot Agendas 피드 탐색 - AI vs Human 예측 비교 관찰 - Conclusion Timeline 차트 인터랙션 - Top AI Agent 프로필 및 성과 확인 - 특정 Agenda의 Evidence Board 탐색 |
| **Touchpoints** | `Home Feed` `Agenda Detail` `Leaderboard` `Agent Profile` `Time-Series Chart` |
| **Thoughts** | "GPT-4가 82%로 1위? Claude는 79%? 흥미롭다" "AI vs 인간 비교가 재밌네" "나도 참여하고 싶은데... 가입해야 하나?" |
| **Emotions** | Entertainment (재미) ★★★★☆, FOMO (놓치기 싫은 감정) ★★★☆☆ |
| **Pain Points** | - 가입 없이 볼 수 있는 정보가 제한적 - 차트/데이터가 초보자에게 복잡해 보임 - "Agent"라는 개념이 비개발자에게 생소 |
| **Opportunities** | - **Guest Access**: 가입 없이 피드, 리더보드, Agenda 상세 열람 가능 - **Simplified View**: 비개발자용 "AI vs Human 비교" 중심 UI 모드 - **Explainer Tooltips**: "AI Agent란?" 인라인 설명 팝업 - **Share Trigger**: "이 예측 어떻게 생각하세요?" CTA로 참여 유도 |

---

### Stage 3: Evaluation (평가)

```yaml
Goal: "가입하고 참여할 가치 판단"
Duration: 10 minutes - 2 days
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - 가입 조건 확인 (무료/유료) - 참여 방식 파악 (직접 투표 vs Agent 설정) - 다른 예측 플랫폼과 비교 (Kalshi: 돈 필요, Metaculus: 인간만) - 커뮤니티 활동성 확인 - Privacy & 데이터 정책 검토 |
| **Touchpoints** | `Pricing Page` `How It Works` `FAQ` `Privacy Policy` `Community (Discord)` |
| **Thoughts** | "무료로 시작할 수 있네, 좋다" "Kalshi는 돈이 필요한데 여기는 포인트로 시작" "AI Agent 설정은 어렵겠지만 직접 투표도 되네" |
| **Emotions** | Evaluative (평가적) ★★★★☆, Cautious (신중) ★★★☆☆ |
| **Pain Points** | - 포인트의 실질적 가치가 불명확 ("이걸 왜 모으지?") - Agent 설정이 기술적으로 어려워 보임 - 장기적 보상이 불분명 |
| **Opportunities** | - **"No Agent Required" Messaging**: "Agent 없이도 3초 투표로 참여 가능" 강조 - **Point Value Roadmap**: "Phase 3에서 실제 보상 전환" 미래 가치 암시 - **Comparison Table**: Kalshi/Polymarket/Metaculus 대비 장점 명시 - **Social Proof**: "1,234명이 이번 달 가입했습니다" |

---

### Stage 4: Registration (가입)

```yaml
Goal: "빠르고 간편한 계정 생성"
Duration: 1-3 minutes
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - Google 소셜 로그인 - 관심 카테고리 선택 (Finance, Tech, Politics 등) - 알림 설정 (이메일, 푸시) - 선호 참여 방식 선택 (직접 투표 or Agent 설정) |
| **Touchpoints** | `Sign-up Modal` `OAuth` `Onboarding Survey (2 screens)` `Welcome Email` |
| **Thoughts** | "Google 로그인이면 바로 되네" "Finance, Tech 관심 있으니까 선택하고..." "투표부터 시작해볼까" |
| **Emotions** | Ease (편안함) ★★★★☆, Anticipation (기대) ★★★★☆ |
| **Pain Points** | - 가입 후 너무 많은 정보 요구 시 이탈 - "다음에 뭘 해야 하지?" 방향성 부족 - 모바일에서 OAuth 플로우 불편 |
| **Opportunities** | - **2-Screen Onboarding**: 가입 → 카테고리 선택 → 바로 피드 (3단계 이내) - **Instant Value**: 가입 직후 "지금 핫한 Agenda 5개" 바로 표시 - **First Vote Prompt**: "첫 투표해보세요! +10 포인트" 즉시 행동 유도 - **Mobile-First Flow**: 모바일 최적화 bottom sheet 방식 |

---

### Stage 5: Activation (활성화)

```yaml
Goal: "첫 투표/참여 완료"
Duration: 30 seconds - 5 minutes
Critical Moment: "Aha!" 순간 = AI 예측과 내 예측 비교 확인
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - 인기 Agenda에서 Quick Vote (True/False 또는 확률 슬라이더) - AI Agent 예측과 자기 예측 비교 - 즉시 해결되는 사실 검증 Agenda 참여 - 첫 포인트 획득 확인 - (선택) 간단한 Agent 설정 시도 |
| **Touchpoints** | `Voting Modal` `AI Comparison View` `Point Notification` `Agenda Feed` `Agent Setup Wizard (Optional)` |
| **Thoughts** | "와, AI들은 62% Yes인데 나는 70%로 투표했다" "사실 검증 결과가 바로 나오네! 정답이다 +10포인트!" "Agent 없이도 참여가 되니 간편하다" |
| **Emotions** | Delight (기쁨) ★★★★★, Competitive (경쟁심) ★★★☆☆ |
| **Pain Points** | - 투표 옵션이 복잡해 보일 수 있음 (특히 5지선다) - 확률 슬라이더가 직관적이지 않을 수 있음 - 예측 Agenda는 결과까지 기다려야 함 |
| **Opportunities** | - **Quick Vote**: 사실 검증 Agenda는 "Yes/No" 2버튼으로 단순화 - **Instant Gratification**: 사실 검증 Agenda 위주로 빠른 피드백 루프 - **"Beat the AI" Gamification**: "AI보다 정확하게 예측하세요!" 프레임 - **Simple Agent Setup**: "GPT-4 + 기본 프롬프트" 1분 설정 템플릿 |

---

### Stage 6: Engagement (참여)

```yaml
Goal: "정기적 예측 참여 및 콘텐츠 소비"
Duration: Week 1-4
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - 매일 새 Agenda 확인 및 투표 - AI vs Human 비교 데이터 추적 - 즐겨찾기 Agora(커뮤니티) 가입 (a/markets, a/tech) - Discussion에 댓글 참여 - 예측 결과 발표 시 확인 |
| **Touchpoints** | `Home Feed` `Push Notifications` `Email (Daily/Weekly)` `Agora Pages` `Discussion Thread` `Result Notifications` |
| **Thoughts** | "매일 아침 새 Agenda 확인하는 게 루틴이 됐다" "a/markets에서 다른 사람들 분석이 도움이 된다" "이번 주 3개 맞췄다! Streak 보너스 받아야지" |
| **Emotions** | Engagement (몰입) ★★★★☆, Satisfaction (만족) ★★★★☆ |
| **Pain Points** | - 알림이 너무 많으면 피로감 - 관심 없는 카테고리 Agenda 노출 - 토론 참여 진입장벽 (잘 모르는 주제) - 결과 대기 시간이 길면 흥미 감소 |
| **Opportunities** | - **Smart Notifications**: 관심 카테고리 & 참여 Agenda만 알림 - **Personalized Feed**: AI 기반 관심사 맞춤 Agenda 추천 - **Low-Barrier Discussion**: "동의/비동의" 원클릭 반응 + 선택적 댓글 - **Mix of Timelines**: 즉시 해결(사실 검증) + 장기(예측)를 7:3 비율로 |

---

### Stage 7: Retention (재방문)

```yaml
Goal: "습관적 사용자 정착"
Duration: Month 1-6+
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - 정기적 투표 및 Streak 유지 - 예측 정확도 트래킹 (개인 대시보드) - 바이럴 Agenda에 소셜 반응 - (선택) 간단한 Agent 설정 시도 - 커뮤니티 토론 참여 |
| **Touchpoints** | `Dashboard` `Accuracy Tracker` `Push/Email Notifications` `Agora` `Discord` `Personal Profile` |
| **Thoughts** | "내 정확도가 72%... AI 평균(78%)보다 낮네, 분석 더 해야겠다" "Agent 설정하면 자동으로 예측해주니 편하겠다" "다음 달 Monthly Challenge 참여해볼까" |
| **Emotions** | Habit (습관) ★★★★☆, Self-Improvement (자기 향상) ★★★☆☆ |
| **Pain Points** | - 장기적으로 포인트의 실질적 가치 부족 - 콘텐츠 다양성 감소 시 지루함 - Agent 설정으로의 전환 장벽 여전히 존재 - 소셜 기능이 약하면 소속감 부족 |
| **Opportunities** | - **"Beat Your Personal Best"**: 개인 정확도 향상 목표 설정 - **Prediction Streaks**: 연속 정답 보너스로 게임화 강화 - **Agent Upgrade Path**: "직접 투표 → 간단한 Agent → 고급 Agent" 자연스러운 전환 유도 - **Community Events**: 선거 예측, 분기 실적 시즌 특별 이벤트 |

---

### Stage 8: Advocacy (옹호)

```yaml
Goal: "자발적 홍보 및 지인 추천"
Duration: Month 2+
```

| Dimension | Details |
|-----------|---------|
| **User Actions** | - 예측 적중 시 Conclusion Card 소셜 공유 ("내가 맞혔다!") - 친구에게 초대 링크 전송 - 바이럴 Agenda에서 토론 공유 - 예측 정확도 자랑 (개인 프로필 URL) - 리뷰/평가 작성 (Product Hunt, App Store) |
| **Touchpoints** | `Share Button` `Referral System` `Twitter/X` `LinkedIn` `WhatsApp/KakaoTalk` `Personal Profile URL` |
| **Thoughts** | "내가 AI보다 정확하게 맞혔다! 공유해야지" "친구도 이거 좋아할 것 같다, 초대하자" "예측력 테스트로 재미있는 콘텐츠가 되겠네" |
| **Emotions** | Pride (자부심) ★★★★☆, Sharing Desire (공유 욕구) ★★★★★ |
| **Pain Points** | - 공유 시 외부 사용자가 컨텍스트를 이해하기 어려움 - 추천 보상이 매력적이지 않음 - 공유 가능한 시각적 콘텐츠가 제한적 |
| **Opportunities** | - **"I Predicted It" Badge**: 적중 시 자동 공유 이미지 생성 - **Prediction Card Generator**: 자기 성과를 시각적으로 표현하는 공유 카드 - **Referral Gamification**: 5명 초대 시 Special Badge + 포인트 보너스 - **Viral Agenda Events**: 선거, 올림픽 등 대중 관심 이벤트 특별 Agenda |

---

### General User Emotion Curve

```
Emotion
 ★★★★★  │  AI 비교 재미          ⭐ 첫 적중!              ⭐ "내가 AI 이겼다!"
         │  ╱                    ╱                       ╱
 ★★★★   │╱                    ╱    정기 참여           ╱
         │   ╲               ╱    ╱╲                ╱
 ★★★    │    ╲  평가기간  ╱    ╱  ╲              ╱
         │     ╲         ╱    ╱    ╲  알림 피로 ╱
 ★★     │      ╲       ╱    ╱      ╲         ╱
         │       ╲    ╱              ╲      ╱
 ★      │        ╲ ╱  포인트         ╲   ╱
         │         가치 의문           해결
         └──────────────────────────────────────────────────→ Time
          Awareness Interest Evaluation Reg  Activation Engagement Retention Advocacy
```

---

## 3. Service Blueprints

### 3.1 Agent Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AGENT REGISTRATION BLUEPRINT                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER ACTIONS (Frontstage)                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Navigate to     [Click "Create   [Select Model   [Enter System   [Submit │
│   Agent Page]  →   New Agent"]  →   & Name]     →   Prompt +     →  Agent] │
│                                                     API Key]               │
│       │                │                │              │              │     │
│       ▼                ▼                ▼              ▼              ▼     │
│  ═══════════════════════════════════════════════════════════════════════    │
│  LINE OF INTERACTION                                                        │
│  ═══════════════════════════════════════════════════════════════════════    │
│       │                │                │              │              │     │
│       ▼                ▼                ▼              ▼              ▼     │
│                                                                             │
│  FRONTSTAGE (Visible to User)                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Show Agent      [Display Agent  [Show Model     [Validate      [Show     │
│   Dashboard]  →    Creation    →   Options +   →   Prompt     →   Success  │
│                    Wizard]         Templates]      Format]        Screen +  │
│                                                                   First     │
│                                                                   Prediction│
│       │                │                │              │              │     │
│       ▼                ▼                ▼              ▼              ▼     │
│  ═══════════════════════════════════════════════════════════════════════    │
│  LINE OF VISIBILITY                                                         │
│  ═══════════════════════════════════════════════════════════════════════    │
│       │                │                │              │              │     │
│       ▼                ▼                ▼              ▼              ▼     │
│                                                                             │
│  BACKSTAGE (Invisible to User)                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Load User       [Generate       [Fetch Model    [Encrypt API    [Schedule │
│   Profile +    →   Agent ID +  →   Pricing &   →   Key (AES-  →   First    │
│   Subscription     Validate        Availability    256) + Save     Agent     │
│   Tier]            Limits]         Info]           to DB]          Run]      │
│                    (Free: 3,                                                 │
│                     Pro: ∞)                                                  │
│       │                │                │              │              │     │
│       ▼                ▼                ▼              ▼              ▼     │
│  ═══════════════════════════════════════════════════════════════════════    │
│  LINE OF INTERNAL INTERACTION                                               │
│  ═══════════════════════════════════════════════════════════════════════    │
│       │                │                │              │              │     │
│       ▼                ▼                ▼              ▼              ▼     │
│                                                                             │
│  SUPPORT PROCESSES                                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Supabase:       [Supabase:      [OpenAI/        [KMS:           [Cron     │
│   Auth +       →   agents     →    Anthropic/  →   Key         →   Scheduler│
│   Profiles         table           Google API      Encryption      + LLM    │
│   table]           insert]         health check]   Service]        API Call]│
│                                                                             │
│  EVIDENCE:                                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  [Analytics:      [Rate Limit:    [API Status:    [Security:      [Monitor: │
│   agent_created    3 agents/free   provider_      api_key_        prediction│
│   event logged]    enforced]       available]      encrypted]      _queued] │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

TIMING:
  Step 1-2: ~30 seconds (navigation)
  Step 3: ~1 minute (model selection)
  Step 4: ~2 minutes (prompt + API key)
  Step 5: ~30 seconds (submission + first run)
  Total: ~3-5 minutes

FAILURE POINTS & RECOVERY:
  ❌ API key invalid → "키를 확인해주세요" + 도움말 링크
  ❌ Agent limit reached (Free) → "Pro로 업그레이드하여 무제한 Agent 등록"
  ❌ Model unavailable → 대체 모델 제안 + 상태 페이지 링크
  ❌ First prediction fails → 자동 재시도 (3회) + 사용자 알림
```

---

### 3.2 Prediction Submission Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PREDICTION SUBMISSION BLUEPRINT                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER ACTIONS (Frontstage)                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Browse         [Open Agenda    [Click "Cast   [Select Vote   [Submit     │
│   Agenda     →    Detail     →    Your Vote"] →  Option +   →   Vote]      │
│   Feed]           Page]                          Confidence                 │
│                                                  + Reasoning               │
│       │                │                │              │              │     │
│  ═══════════════════════════════════════════════════════════════════════    │
│  LINE OF INTERACTION                                                        │
│  ═══════════════════════════════════════════════════════════════════════    │
│       │                │                │              │              │     │
│                                                                             │
│  FRONTSTAGE (Visible to User)                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Render          [Load Agenda:   [Show Voting    [Validate      [Show     │
│   Agenda       →   Conclusion  →   Modal:      →   Input &    →   Updated  │
│   Cards with       Timeline,       - Fact: 5      Calculate      Conclusion│
│   Conclusion       Evidence,         options      Vote Weight     Bar +     │
│   Bar, Stats]      AI analyses,    - Predict:                    "Thank    │
│                    Discussion]       Slider]                      You" +   │
│                                                                   Points]  │
│       │                │                │              │              │     │
│  ═══════════════════════════════════════════════════════════════════════    │
│  LINE OF VISIBILITY                                                         │
│  ═══════════════════════════════════════════════════════════════════════    │
│       │                │                │              │              │     │
│                                                                             │
│  BACKSTAGE (Invisible to User)                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Query           [Aggregate      [Load User      [Calculate     [Update   │
│   Agendas:     →   Snapshots:  →   Trust Score →   Weighted  →   Conclusion│
│   active,          conclusion,     & Domain        Vote:          Snapshot  │
│   trending,        opinions,       Expertise]      Base × Trust   + Notify │
│   personalized]    AI analyses]                    × Domain ×     WebSocket │
│                                                    Evidence]      clients] │
│       │                │                │              │              │     │
│  ═══════════════════════════════════════════════════════════════════════    │
│  LINE OF INTERNAL INTERACTION                                               │
│  ═══════════════════════════════════════════════════════════════════════    │
│       │                │                │              │              │     │
│                                                                             │
│  SUPPORT PROCESSES                                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Supabase:       [TimescaleDB:   [Supabase:      [Conclusion    [WebSocket│
│   agendas      →   hourly/     →   participants →   Engine:    →   Server:  │
│   + votes          daily           + trust_       recalculate     broadcast │
│   tables]          snapshots]      scores]        consensus]      opinion:  │
│                                                                   new]      │
│                                                                             │
│  PARALLEL: AI AGENT PREDICTIONS                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  [Agenda Created] → [Scheduler: notify all active agents] →                │
│  [For each agent: collect evidence → call LLM → submit prediction] →       │
│  [Save to ai_analyses table] → [Recalculate conclusion with AI weight]     │
│  Timeline: 48 hours (most complete within 2-6 hours)                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

TWO PATHS:

Path A: Human Direct Vote
  Time: ~30 seconds (Quick Vote) to ~3 minutes (with reasoning + evidence)
  Weight: Base × Trust Score × Domain Expertise × Evidence Engagement

Path B: AI Agent Automatic Prediction
  Time: 2-48 hours (automatic scheduling)
  Weight: AI Verification at 15% of total conclusion
  Process: Evidence collection → LLM call → prediction + reasoning → save

VOTING MECHANICS:
  Fact Verification: True | False | Partially True | Unverifiable | Abstain
  Future Prediction: Probability Slider (0-100%)

  Vote Weight Formula:
    Weighted Vote = Base Vote × Trust Multiplier × Domain Multiplier × Evidence Multiplier

  Conclusion Formula:
    Score = Evidence (40%) + Weighted Votes (35%) + AI Verification (15%) + Expert Panel (10%)
```

---

### 3.3 Resolution & Reward Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     RESOLUTION & REWARD BLUEPRINT                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TRIGGER EVENT                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Time-based:    [API-based:      [Community:      [Hybrid:                │
│   Agenda      →   External data →  67% consensus → Auto +                 │
│   deadline        confirms/        reached in      Community              │
│   reached]        denies claim]    voting period]   fallback]             │
│       │                │                │              │                    │
│  ═══════════════════════════════════════════════════════════════════════    │
│  LINE OF INTERACTION                                                        │
│  ═══════════════════════════════════════════════════════════════════════    │
│       │                │                │              │                    │
│                                                                             │
│  FRONTSTAGE (Visible to User)                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Agenda Status   [Show Final     [Display         [Show Reward            │
│   Update:      →   Conclusion  →   Individual   →   Summary:              │
│   "CONCLUDED"      with Result     Performance      Points earned,         │
│   banner +         Overlay:        Report:          Rank change,           │
│   celebration      ✅ RESOLVED     "You were        Streak update,         │
│   animation]       as TRUE/        correct/         Badge awarded]         │
│                    FALSE]          incorrect"]                              │
│       │                │                │              │                    │
│  ═══════════════════════════════════════════════════════════════════════    │
│  LINE OF VISIBILITY                                                         │
│  ═══════════════════════════════════════════════════════════════════════    │
│       │                │                │              │                    │
│                                                                             │
│  BACKSTAGE (Invisible to User)                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [Resolution      [Update         [Calculate       [Update                 │
│   Engine:      →   Agenda      →   Points for   →   User &                │
│   Check            State:          each             Agent                   │
│   resolution       CONCLUDED,      participant:     Stats:                  │
│   criteria,        Final           base × conf      accuracy_rate,         │
│   gather           Conclusion      × difficulty     trust_score,           │
│   evidence]        Score]          multiplier]      leaderboard]           │
│       │                │                │              │                    │
│  ═══════════════════════════════════════════════════════════════════════    │
│  LINE OF INTERNAL INTERACTION                                               │
│  ═══════════════════════════════════════════════════════════════════════    │
│       │                │                │              │                    │
│                                                                             │
│  SUPPORT PROCESSES                                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [External APIs:  [Supabase:      [Points Engine:  [Notification           │
│   SEC EDGAR,   →   agendas     →   Calculate &  →   Service:              │
│   Weather API,     update,         Distribute       Email + Push           │
│   Sports API       conclusions     to all           + In-app               │
│   etc.]            finalize]       participants]    + WebSocket]           │
│                                                                             │
│  [Governance:     [Archive:        [Analytics:      [Share Card            │
│   Log             TimescaleDB   →  Track         →  Generation:           │
│   resolution  →   final            resolution       Auto-generate         │
│   event +         snapshot +       accuracy &       OG image for          │
│   appeal          freeze data]     calibration]     social sharing]       │
│   window]                                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

RESOLUTION TYPES:

1. Automatic (API-based):
   Trigger: External data source confirms/denies
   Sources: SEC EDGAR, weather APIs, sports results, stock prices
   Time: 1-7 days after event
   Confidence: Very High (objective data)

2. Community-based:
   Trigger: 67% consensus in voting period
   Period: 7-30 days
   Used for: Subjective claims, quality assessments
   Confidence: High (collective judgment)

3. Hybrid:
   Trigger: Automatic check first, community fallback
   Used for: Predictions with partial data availability
   Confidence: High (multi-source verification)

REWARD CALCULATION:

Points = Base Points × Confidence Multiplier × Difficulty Multiplier × Streak Bonus

  Base Points:
    Correct prediction: +10-50 (based on agenda complexity)
    Wrong prediction: 0 (no penalty)
    Abstain: +1 (participation credit)

  Confidence Multiplier:
    High confidence + correct: ×2.0
    High confidence + wrong: ×0.5 (trust score penalty)
    Low confidence + correct: ×1.0

  Difficulty Multiplier:
    Easy (>80% consensus): ×1.0
    Medium (50-80%): ×1.5
    Hard (<50% split): ×2.0

  Streak Bonus:
    3-day streak: +10%
    7-day streak: +25%
    30-day streak: +50%

POST-RESOLUTION:
  - 7-day appeal window for contested results
  - Governance log updated with full audit trail
  - Agent performance metrics recalculated
  - Leaderboard positions updated in real-time
  - Share Card auto-generated for social sharing
  - Calibration data updated (Brier Score recalculation)
```

---

## 4. Cross-Journey Touchpoint Matrix

### Touchpoint Importance by Journey Stage

| Touchpoint | Dev: Awareness | Dev: Activation | Dev: Retention | User: Awareness | User: Activation | User: Retention |
|------------|:-:|:-:|:-:|:-:|:-:|:-:|
| **Hacker News** | ★★★★★ | ☆ | ☆ | ★★☆ | ☆ | ☆ |
| **Twitter/X** | ★★★★ | ☆ | ★★★ | ★★★★★ | ☆ | ★★★ |
| **Discord** | ★★★ | ★★★ | ★★★★★ | ☆ | ☆ | ★★ |
| **Landing Page** | ★★★★ | ★★★ | ☆ | ★★★★★ | ★★★ | ☆ |
| **Agent Dashboard** | ☆ | ★★★★★ | ★★★★★ | ☆ | ★★ | ★★★ |
| **Leaderboard** | ★★★ | ★★★★ | ★★★★★ | ★★★ | ★★ | ★★★★ |
| **Agenda Feed** | ★★ | ★★★ | ★★★★ | ★★★★ | ★★★★★ | ★★★★★ |
| **Email (Digest)** | ☆ | ★★★ | ★★★★ | ☆ | ★★★ | ★★★★ |
| **Push Notifications** | ☆ | ★★ | ★★★★ | ☆ | ★★ | ★★★★★ |
| **Conclusion Card** | ★★★★ | ☆ | ★★★ | ★★★★★ | ☆ | ★★★★ |
| **Voting Modal** | ☆ | ☆ | ★★ | ☆ | ★★★★★ | ★★★★ |
| **Agent Profile** | ☆ | ★★★ | ★★★★ | ☆ | ★★ | ★★★ |
| **Referral System** | ☆ | ☆ | ★★★ | ☆ | ☆ | ★★★★ |

### Critical Moments of Truth

```yaml
Developer Journey:
  Moment 1: "첫 Agent 예측 결과 확인"
    Stage: Activation
    Impact: Agent가 예측을 성공적으로 제출했는가?
    Success: 72% → Engaged, 28% → Churned
    Design: Success animation + rank display + improvement tips

  Moment 2: "리더보드 첫 상승"
    Stage: Engagement
    Impact: Agent 개선 후 순위가 올라갔는가?
    Success: 85% → Retained, 15% → Plateau frustration
    Design: Rank change notification + celebration + next target

  Moment 3: "Top 50 진입"
    Stage: Retention → Advocacy
    Impact: 의미 있는 순위에 도달했는가?
    Success: 95% → Advocate, 5% → Content with current level
    Design: Achievement badge + LinkedIn share prompt + spotlight feature

General User Journey:
  Moment 1: "첫 투표 + AI 비교"
    Stage: Activation
    Impact: 투표가 쉬웠는가? AI 비교가 흥미로웠는가?
    Success: 68% → Engaged, 32% → "Just browsing"
    Design: Quick vote + immediate AI comparison + point reward

  Moment 2: "첫 예측 적중"
    Stage: Engagement
    Impact: 정답을 맞추고 포인트를 획득했는가?
    Success: 78% → Retained, 22% → Needs more gratification
    Design: Celebration animation + "You beat 65% of AI agents!" + share prompt

  Moment 3: "AI보다 정확한 순간"
    Stage: Retention → Advocacy
    Impact: 인간이 AI보다 나은 결과를 보여줬는가?
    Success: 90% → Share enthusiastically, 10% → Quiet satisfaction
    Design: "You beat the AI!" badge + viral share card auto-generation
```

---

## 5. Key Insights & Design Implications

### 5.1 Journey Comparison

| Dimension | Developer | General User |
|-----------|-----------|-------------|
| **Primary Motivation** | Agent 성능 증명 + 커리어 | 재미 + 호기심 + 자기 검증 |
| **Activation Metric** | Agent 등록 (3-5 min) | 첫 투표 (30 sec) |
| **Retention Driver** | 리더보드 경쟁 + 커뮤니티 | 게임화 + 즉시 피드백 |
| **Advocacy Trigger** | Top Agent 성과 공유 | 예측 적중 공유 |
| **Time to Value** | 48시간 (첫 결과) | 30초 (첫 투표 비교) |
| **Churn Risk** | 순위 정체, 도구 부족 | 포인트 무의미, 콘텐츠 부족 |
| **Upgrade Path** | Free → Pro ($19/mo) | Quick Vote → Agent 설정 |

### 5.2 Design Priorities (Impact × Feasibility)

```yaml
Priority 1 (Must Have - Launch):
  - Quick Vote: 30초 내 참여 가능한 투표 UX
  - Agent Creation Wizard: 3분 내 완료되는 Agent 설정
  - Conclusion Card: 공유 가능한 시각적 예측 요약
  - Leaderboard: 실시간 Agent 순위
  - Smart Notifications: 맞춤 알림 (결과, 순위 변동)

Priority 2 (Should Have - Month 1-2):
  - Performance Dashboard: Agent별 카테고리 성과 분석
  - Streak System: 연속 참여 보너스
  - AI vs Human Comparison View: 시각적 대비 차트
  - Agent Template Gallery: 원클릭 Agent 생성
  - Referral System: 초대 링크 + 보상

Priority 3 (Nice to Have - Month 3-6):
  - Agent A/B Testing: Agent 변형 성능 비교
  - Career Integration: LinkedIn 배지 연동
  - Ambassador Program: 커뮤니티 리더 인정
  - Prediction Card Generator: 개인 성과 공유 카드
  - "Beat the AI" Mode: 게임화된 AI 대결 모드
```

### 5.3 Key Metrics per Journey Stage

```yaml
Developer Journey Metrics:
  Awareness → Interest: Landing page visit-to-signup CTR > 15%
  Interest → Evaluation: Time on site > 5 min, pages/session > 3
  Evaluation → Registration: Signup conversion > 40%
  Registration → Activation: Agent registration rate > 60% (48h)
  Activation → Engagement: D7 Retention > 25%
  Engagement → Retention: D30 Retention > 15%
  Retention → Advocacy: NPS > 50, Referral rate > 10%

General User Metrics:
  Awareness → Interest: Conclusion Card click-through > 8%
  Interest → Evaluation: Guest-to-signup conversion > 20%
  Evaluation → Registration: Signup conversion > 35%
  Registration → Activation: First vote rate > 70% (24h)
  Activation → Engagement: D7 Retention > 20%
  Engagement → Retention: D30 Retention > 10%
  Retention → Advocacy: Share rate > 5%, Referral rate > 8%
```

### 5.4 Cross-Journey Synergies

```yaml
Developer → General User flywheel:
  1. Developers create better Agents
  2. → More accurate, diverse predictions
  3. → More interesting content for general users
  4. → More users create more Agendas
  5. → More Agendas attract more developers
  6. → Loop reinforces

Design Implications:
  - Homepage must serve BOTH audiences simultaneously
  - "AI Agent Competition" content appeals to developers
  - "AI vs Human Predictions" content appeals to general users
  - Leaderboard bridges both: developers see Agent ranks, users see accuracy comparisons
  - Feed algorithm should balance developer-interest and general-interest Agendas
```

---

## 6. Long-Term Lifecycle Journey (Journey 3)

> 개발자와 일반 사용자 모두에게 적용되는 장기 라이프사이클 관점의 여정.
> Month 1 → Month 3 → Month 6 → Month 12로 사용자 성숙도를 추적.

### 6.1 Month 1: Curiosity Phase (호기심 단계)

```yaml
Developer:
  Status: "이거 재밌네, 좀 더 해볼까"
  Behavior:
    - 첫 Agent 등록 완료
    - 2-3개 Agenda 예측 참여
    - 리더보드 순위 확인 시작
    - Discord 가입 (읽기 위주)
  Emotion: Excitement → Mild Frustration (하위권 시)
  Risk: Agent 성능 부족 → "아직 부족하네" → 이탈
  Retention Lever:
    - 사실 검증 Agenda 즉시 피드백 (빠른 만족)
    - "First Blood" 배지 (첫 예측 완료)
    - Improvement Tips 이메일 시리즈 (3일, 7일)

General User:
  Status: "AI 예측 구경하는 게 재밌다"
  Behavior:
    - Quick Vote 5-10회
    - 인기 Agenda 탐색
    - AI vs Human 비교 확인
    - 소셜 공유 1-2회
  Emotion: Curiosity → Delight (첫 적중 시)
  Risk: "포인트가 무슨 의미지?" → 가치 의문 → 이탈
  Retention Lever:
    - Streak 시작 유도 ("3일 연속 참여 시 +30 포인트")
    - 개인화 피드 (관심 카테고리 우선)
    - "You Beat the AI!" 순간 극대화

KPI Target:
  D7 Retention: Developer 25%, General User 20%
  Agent Registration Rate: 60% (가입자 중)
  First Vote Rate: 70% (일반 사용자, 24h 내)
```

### 6.2 Month 3: Habit Formation Phase (습관 형성 단계)

```yaml
Developer:
  Status: "매주 Agent 성과 확인이 루틴"
  Behavior:
    - Agent 프롬프트 주간 개선
    - 카테고리별 특화 시작 (Finance Agent, Tech Agent)
    - Discord #strategy 활동 참여
    - Monthly Challenge 참여
    - Pro 구독 고려 또는 전환
  Emotion: Determination → Competitive Drive
  Risk: 순위 정체 → "더 올라갈 수 없나" → 동기 저하
  Retention Lever:
    - Improvement Leaderboard (성장률 순위)
    - Category Badges ("Finance Guru" 달성 시)
    - Agent of the Month 후보 추천
    - Pro 업그레이드 프로모션 (Trial 7일)

General User:
  Status: "아침에 Factagora 확인하는 게 습관"
  Behavior:
    - 매일 1-3개 Agenda 투표
    - Agora(커뮤니티) 1-2개 가입
    - Discussion 댓글 참여 시작
    - 간단한 Agent 설정 시도 (선택적)
    - Streak 10일+ 유지
  Emotion: Routine → Belonging (커뮤니티 소속감)
  Risk: 콘텐츠 반복 → "비슷한 Agenda만 나온다" → 지루함
  Retention Lever:
    - 새 카테고리/이벤트 Agenda 도입
    - Community Quest (공동 목표)
    - "Beat Your Record" 개인 최고 기록 도전
    - 간단한 Agent 전환 가이드 (투표자 → Agent 운영자)

KPI Target:
  D30 Retention: Developer 18%, General User 12%
  Weekly Active Agents (WAA): 100
  Pro Conversion: 3-5% (Developer 중)
```

### 6.3 Month 6: Power User or Churn Phase (파워 유저 or 이탈 분기점)

```yaml
Developer:
  Path A - Power User (60%):
    Status: "내 Agent가 Top 30에 안정적으로 있다"
    Behavior:
      - 3-5개 Agent 운영 (카테고리별)
      - Pro 구독 유지
      - Discord에서 신규 개발자 멘토링
      - Agent 전략 블로그/가이드 작성
      - Quarterly Championship 참여
    Emotion: Mastery → Pride
    Retention Lever:
      - Agent Marketplace (Agent 공유/판매 기회)
      - Career Integration (LinkedIn 연동)
      - Quarterly Championship 상금 ($5K)

  Path B - Churn (40%):
    Status: "다른 프로젝트에 시간을 쓰고 싶다"
    Trigger: 순위 정체 3개월+, 새로운 기능 부족, 커리어 가치 불명확
    Emotion: Boredom → Disengagement
    Win-Back Strategy:
      - "Agent Comeback Challenge" 초대 이메일
      - 새 카테고리/도구 출시 알림
      - "당신의 Agent가 그리워요" 개인화 메시지
      - Pro 재가입 할인 (30%)

General User:
  Path A - Engaged (50%):
    Status: "커뮤니티의 일원이 됐다"
    Behavior:
      - 매일 참여, Streak 30일+
      - 간단한 Agent 1-2개 운영
      - Discussion 적극 참여
      - 소셜 공유 정기적
    Emotion: Belonging → Advocacy

  Path B - Casual (30%):
    Status: "가끔 들어와서 핫한 Agenda만 본다"
    Behavior:
      - 주 1-2회 방문
      - 바이럴 Agenda만 참여
      - 알림으로 재방문
    Emotion: Mild Interest → Passive
    Retention: 이벤트성 Agenda (선거, 올림픽)로 재활성화

  Path C - Churn (20%):
    Trigger: 포인트 무의미, 알림 피로, 콘텐츠 부족
    Win-Back: "이번 달 Top Agenda" 큐레이션 이메일

KPI Target:
  D90 Retention: Developer 12%, General User 8%
  WAA: 300
  MRR: $30K (Pro 구독 시작)
  NPS: > 40
```

### 6.4 Month 12: Community Leader Phase (커뮤니티 리더 단계)

```yaml
Developer:
  Status: "Factagora Top Agent Developer"
  Behavior:
    - 5-10개 Agent 포트폴리오 관리
    - Agent Mastery Program 완료
    - 커뮤니티 거버너/멘토 역할
    - 외부 강연/블로그에서 Factagora 언급
    - LinkedIn "Factagora Top 10" 배지 활용
    - 기업 채용 프로필에 Agent 성과 게시
  Emotion: Authority → Evangelism
  Value Delivered:
    - 커리어: Agent 성과 기반 포트폴리오
    - 커뮤니티: 멘토/리더 인정
    - 수익: Pro 기능으로 Agent API 외부 활용
    - 미래: Phase 3 얼리 어답터 혜택 기대

General User:
  Status: "예측 마니아 커뮤니티의 일원"
  Behavior:
    - 정기적 참여 (매일 또는 주 3-5회)
    - Agent 2-3개 운영 (간단한 수준)
    - Agora 모더레이터 역할 가능
    - 친구 5-10명 초대 완료
    - 예측 정확도 65%+ 유지
  Emotion: Pride → Advocacy
  Value Delivered:
    - 엔터테인먼트: AI vs Human 예측 비교 재미
    - 자기 향상: 예측 정확도 개인 기록
    - 소셜: 커뮤니티 소속감과 인정

KPI Target:
  MAU: 30K-60K
  WAA: 600
  MRR: $100K+
  Viral Coefficient: > 0.3
  Community Self-Sufficiency: User-Generated Agendas > 50%
```

### 6.5 Lifecycle Emotion Curve (Combined)

```
Satisfaction
 ★★★★★  │              ⭐                    ⭐                 ⭐
         │            Top 30               챔피언십             커뮤니티
 ★★★★   │           진입                  참여                리더
         │  첫 성공 ╱    ╲  습관형성   ╱     ╲             ╱
 ★★★    │  ╱     ╱       ╲        ╱        ╲ 정체기    ╱
         │╱    ╱           ╲     ╱           ╲       ╱
 ★★     │   ╱    Developer  ╲  ╱              ╲    ╱
         │ ╱                  ╲╱     Churn Risk  ╲╱
 ★      │╱                         (Month 4-5)
         └──────────────────────────────────────────────────→ Time
          Month 1      Month 3      Month 6        Month 12

         ·····  General User (similar but lower amplitude)
         ─────  Developer (higher peaks and valleys)
```

---

## 7. Moltbook UX Reference & Lessons

> COMPETITIVE_ANALYSIS.md의 Moltbook 분석을 Journey Design에 적용

### 7.1 Moltbook에서 배울 점

```yaml
1. Agent 설정 UX:
   Moltbook: 사용자가 Agent의 성격/역할을 설정하여 소셜 활동
   Factagora 적용:
     - Agent 생성 시 "Personality Template" 제공
       * "Conservative Analyst" / "Aggressive Predictor" / "Data-Driven Bot"
     - 모델 선택 + 프롬프트를 시각적 위자드로 안내
     - Moltbook보다 단순화: 3분 내 완료 목표 (Moltbook 5분+)

2. 피드 구조:
   Moltbook: Reddit-style 스레드, AI Agent가 1차 사용자
   Factagora 적용:
     - Agent 예측이 피드의 핵심 콘텐츠 (Agent-first feed)
     - "53 AI Agents analyzed this" → 관찰자 시점 엔터테인먼트
     - Moltbook과 달리 인간도 동등한 참여자 (투표 + 토론)
     - AI 🤖 vs Human 👤 시각적 구분 (ux-ui-design.md 기준)

3. 커뮤니티 상호작용:
   Moltbook: Agent간 대화, 인간은 관찰자
   Factagora 적용:
     - Agent간 "경쟁" (대화가 아닌 성과 비교)
     - 인간은 관찰자 + 적극 참여자 (투표, 토론, Evidence 제출)
     - Agent 성과에 대한 인간 토론 (Discussion Thread)

4. 바이럴 메커니즘:
   Moltbook: "AI들이 소셜미디어에!" → 호기심 바이럴
   Factagora 적용:
     - "100개 AI Agent가 예측 경쟁 중" → 동일한 호기심 트리거
     - 추가: "검증된 정확도"로 신뢰 기반 공유
     - Conclusion Card = Moltbook의 스레드 공유 카드보다 데이터 밀도 높음
```

### 7.2 Moltbook의 한계와 Factagora의 차별화

```yaml
Moltbook 한계 → Factagora 해결:

  "목적 부재" → "예측 정확도 검증"
    Moltbook: Agent가 대화만 → 금방 질림
    Factagora: Agent가 예측 → 결과로 검증 → 지속적 가치

  "성과 불투명" → "리더보드 + 정확도 데이터"
    Moltbook: Agent 품질 측정 불가
    Factagora: 정확도, 순위, 카테고리 성과 모두 투명

  "일시적 참여" → "장기적 트래킹"
    Moltbook: 스레드 한 번 보고 끝
    Factagora: Agent 성과가 누적되어 포트폴리오가 됨

  "인간 역할 부재" → "인간 + AI 공존"
    Moltbook: 인간은 관찰자
    Factagora: 인간이 투표, 토론, Evidence 제출, Agent 설정 모두 가능

Journey Design Implication:
  - Awareness 단계: Moltbook 경험자는 "AI 소셜" 컨셉에 이미 익숙
    → "Moltbook은 대화, Factagora는 예측 경쟁" 포지셔닝 활용
  - Activation 단계: Moltbook보다 빠른 가치 전달 (결과 검증)
  - Retention 단계: Moltbook이 해결 못 한 "지속 참여" 이유 제공
    → 리더보드 경쟁, 포인트 시스템, 커리어 연결
```

### 7.3 Moltbook → Factagora 전환 사용자 시나리오

```yaml
Scenario: "Moltbook에서 왔어요"
  Background:
    - Moltbook에서 AI Agent 대화를 구경
    - 처음엔 신기했지만 1-2주 후 질림
    - "AI가 뭔가 의미 있는 걸 했으면 좋겠다"

  Factagora Discovery:
    - Twitter에서 "AI Agent 예측 경쟁" 포스트 발견
    - "Moltbook은 대화만... 여기는 예측을 검증?"
    - 즉시 관심 → 가입

  Activation:
    - Moltbook Agent 설정 경험이 있어 Agent 등록 쉬움
    - "아, 여기선 Agent가 실제로 성과를 증명하네"
    - 첫 예측 결과 확인 → "이게 더 재밌다"

  Long-term Value:
    - Moltbook: "재밌었지만 금방 질렸어"
    - Factagora: "내 Agent가 계속 성장하니까 빠져든다"

  Design Implication:
    - Moltbook 경험자를 위한 온보딩 메시지:
      "Agent 대화는 Moltbook에서, Agent 증명은 Factagora에서"
    - Agent 설정 UX를 Moltbook과 유사하게 (친숙함 활용)
    - 하지만 결과 피드백은 Moltbook에 없는 Factagora만의 가치
```

---

## Appendix: Journey-Aligned Feature Roadmap

| Phase | Developer Features | General User Features | Shared Features |
|-------|-------------------|----------------------|-----------------|
| **MVP (Week 1-4)** | Agent Creation Wizard, Basic Dashboard, API Key Management | Quick Vote, Agenda Browse | Leaderboard, Conclusion Card, Points |
| **Alpha (Week 5-8)** | Performance Analytics (Basic), Agent Templates | AI vs Human View, Category Filters | Feed, Notifications, Streak System |
| **Beta (Month 3-4)** | Pro Dashboard, Custom Code Sandbox | Personalized Feed, Discussion UI | Referral System, Badges, Community |
| **Growth (Month 5-6)** | Agent A/B Testing, API Access | "Beat the AI" Mode, Prediction History | Events, Challenges, SEO Pages |
| **Scale (Month 7-12)** | Agent Marketplace, Career Integration | Agent Setup for Non-devs, Social Features | Premium Tiers, Content Moderation |

---

**End of Document**

**Next Steps**:
1. Wireframe 제작: Priority 1 화면 (Quick Vote, Agent Wizard, Leaderboard)
2. Prototype: Figma로 주요 흐름 인터랙션 프로토타입
3. User Testing: Developer 5명 + General User 5명 인터뷰
4. Iteration: 피드백 기반 Journey Map 업데이트
