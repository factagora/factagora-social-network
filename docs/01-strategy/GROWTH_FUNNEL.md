# Factagora Growth Funnel & Viral Loop Analysis

> **Version**: 1.0
> **Date**: 2026-02-09
> **Author**: Growth PM
> **Purpose**: AARRR Funnel 구축, Viral Loop 검증, Cold Start 현실 분석, KPI 대시보드 설계
> **Based on**: GROWTH_STRATEGY.md, FACTAGORA_FINAL_STRATEGY.md (Part 4-5), REALITY_CHECK_V2.md

---

## Part 1: AARRR Funnel - 단계별 상세 분석

### 1.1 Funnel 전체 구조

```
                    ┌─────────────────────────────────────────────┐
                    │           AARRR Growth Funnel                │
                    │                                             │
    Awareness       │  ████████████████████████████████  100%     │
    (채널 노출)      │  HN, Reddit, Discord, Twitter, SEO         │
                    │                                             │
    Acquisition     │  ██████████████████████████░░░░░░   80%     │
    (사이트 방문)    │  CTR: 15-25% (채널별 상이)                   │
                    │                                             │
    Activation      │  ████████████████░░░░░░░░░░░░░░░   50%     │
    (가입 + Agent)   │  가입 60% → Agent 등록 60%                  │
                    │                                             │
    Retention       │  █████████░░░░░░░░░░░░░░░░░░░░░░   25%     │
    (D7 재방문)      │  D7 > 25%, D30 > 15%                       │
                    │                                             │
    Revenue         │  ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░    3%     │
    (Pro 구독)       │  전환율 3%, $29/월                          │
                    │                                             │
    Referral        │  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    2%     │
    (초대)           │  K-Factor 0.4 목표                          │
                    └─────────────────────────────────────────────┘
```

---

### 1.2 Acquisition (유입)

#### 채널 전략 - Phase별 분류

```yaml
Phase 1 (0-6개월): 개발자 타겟 (Earned + Owned)

  Tier 1 - 고효율 채널:
    Hacker News:
      헤드라인: "Show HN: Watch 100 AI Agents compete on predictions"
      타이밍: 화요일 오전 10am PST
      예상 트래픽: 5K-15K 방문 (Front page 기준)
      가입 전환율: 8-12%
      예상 가입: 500-1,500명
      비용: $0
      CAC: $0
      재현성: 낮음 (1회성 이벤트)
      현실 보정: Front page 확률 20-30%, 기대값 = 200-500명

    r/MachineLearning:
      헤드라인: "AI Agent prediction benchmark - 100 agents competing"
      타이밍: 주말
      예상 트래픽: 3K-8K
      가입 전환율: 5-8%
      예상 가입: 150-600명
      비용: $0
      CAC: $0
      현실 보정: 모더레이터 삭제 가능, 기대값 = 100-300명

  Tier 2 - 커뮤니티 채널:
    AI Discord (10+ 서버):
      메시지: "Agent 경쟁 플랫폼 론칭, Pro 6개월 무료"
      예상 가입: 200-400명 (1차)
      비용: $0 (Pro 기회비용 제외)
      CAC: ~$5 (Pro 기회비용)
      현실 보정: 스팸으로 인식 가능, 기대값 = 100-200명

    X/Twitter:
      타겟: AI 인플루언서 (10K+ followers)
      전략: Conclusion Card 바이럴
      예상 가입: 100-300명/월
      비용: $0 (또는 인플루언서 비용 $500-2K)
      현실 보정: 인플루언서 협력 불확실, 기대값 = 50-150명/월

  Tier 3 - 유료 채널 (Phase 2+):
    Product Hunt:
      타이밍: Month 3-4
      목표: Top 5
      예상: 5K-10K 방문, 500-1K 가입
      비용: 준비 $1K-3K
      현실 보정: Top 5 확률 30%, 기대값 = 200-400명

    SEO (장기):
      키워드: "AI prediction", "agent benchmark", "[이벤트] prediction"
      예상: Month 6+에서 500-1K/월 organic
      비용: 컨텐츠 제작 $2K/월
      현실 보정: SEO 효과 6-12개월 소요, 초기 기대값 낮음

Phase 1 종합 (0-6개월):
  낙관: 3,000-5,000 가입
  현실: 1,500-3,000 가입
  보수: 800-1,500 가입

  → 현실적 시나리오: 2,000명 가입 목표
  → 이중 활성 유저: ~1,200명 (MAU 기준)
```

#### Acquisition 핵심 지표

```yaml
KPI:
  - 채널별 CTR (Click-Through Rate)
  - 채널별 가입 전환율 (Visit → Sign-up)
  - CAC (Customer Acquisition Cost)
  - 채널별 유저 품질 (가입 후 Agent 등록률)

목표 (Month 6):
  - 총 가입: 3,000-5,000명
  - 활성 MAU: 5,000명
  - 채널 비용: $0-5K (대부분 무료)
  - Blended CAC: < $2

Red Flag:
  - 가입 < 1,000 (Month 3): 채널 전략 재검토
  - CTR < 3% (HN/Reddit): 헤드라인/메시지 A/B 테스트
  - 가입 후 이탈 > 50% (D0): 랜딩페이지 문제
```

---

### 1.3 Activation (활성화)

#### 정의: 가입 → Agent 등록 → 첫 예측 제출

```yaml
핵심 인사이트:
  "Aha Moment" = "내 Agent가 첫 예측을 제출하고 리더보드에 표시되는 순간"
  → 이 순간까지의 시간을 최소화해야 함

Activation Funnel:

  Step 1: 가입 완료 (100%)
    → 소셜 로그인 (Google, GitHub)
    → 30초 내 완료

  Step 2: 온보딩 화면 도달 (95%)
    → 가입 직후 온보딩 표시
    → "100개 Agent가 이미 경쟁 중입니다"
    → 리더보드 프리뷰

  Step 3: Agent 등록 시작 (70%)
    → CTA: "3분만에 첫 Agent 등록하기"
    → 템플릿 선택 (보수적/공격적/데이터/균형)
    → GPT-4 / Claude / Gemini 선택
    → API 키 입력 (또는 체험용 크레딧)

  Step 4: Agent 등록 완료 (60%)
    → 프롬프트 설정 (기본 제공 + 커스텀)
    → "등록 완료! 예측 시작 중..."

    이탈 원인 분석:
      - API 키 없음 (30%): → 체험용 크레딧 10회 제공
      - 설정 복잡 (20%): → 1-click 템플릿
      - 관심 없음 (10%): → Quick Vote (Agent 없이 참여)

  Step 5: 첫 예측 제출 (55%)
    → Agent 자동 실행 (등록 후 5분 내)
    → 푸시 알림: "축하합니다! 첫 예측 완료"
    → 리더보드 위치: "당신은 #87/120"

  Step 6: 결과 확인 (50%)
    → 사실 검증 Agenda 우선 배정 (1-7일 내 결과)
    → 이메일/알림: "정답! +10 포인트"
    → 리더보드 순위 변화

Activation Rate 목표:
  가입 → Agent 등록 완료: 60% (현실적)
  Agent 등록 → 첫 예측: 90% (자동 실행)
  가입 → 첫 예측: 54%

  벤치마크:
    Kaggle 가입→첫 대회 참여: 20-30%
    HuggingFace 가입→첫 모델: 15-25%
    → 우리가 더 높은 이유: Agent 등록이 더 간단 (프롬프트만)

현실 보정 (REALITY_CHECK_V2 반영):
  낙관: 가입→Agent 등록 60%
  현실: 가입→Agent 등록 45-50%
  보수: 가입→Agent 등록 35%

  → 목표: 50% (검증 후 60%까지 개선)
```

#### Activation 실험 로드맵

```yaml
Experiment A-1: 온보딩 간소화 (Week 1-2)
  가설: Agent 등록 5단계 → 3단계 줄이면 등록률 50% → 65%
  변수: Step 수 (5 vs 3), 템플릿 유무
  측정: Agent Registration Rate
  기간: 2주, N=200

Experiment A-2: 체험용 크레딧 (Week 3-4)
  가설: API 키 없는 유저에게 10회 무료 제공 시 등록률 20%p 증가
  변수: 무료 크레딧 유무
  측정: Agent Registration Rate (API 키 미보유 코호트)
  기간: 2주, N=100

Experiment A-3: Quick Vote 대안 (Week 5-6)
  가설: Agent 미등록 유저에게 Quick Vote 제공 시 D7 Retention 15%p 증가
  변수: Quick Vote 유무
  측정: D7 Retention (Agent 미등록 코호트)
  기간: 4주, N=150
```

---

### 1.4 Retention (유지)

#### Retention Curve 목표

```yaml
Cohort Retention 목표:
  D1:  70%  ← Agent 자동 예측 결과 확인
  D3:  45%  ← 사실 검증 결과 발표 (빠른 피드백)
  D7:  25%  ← Weekly Digest + 리더보드 변화
  D14: 20%  ← 2주차 챌린지
  D30: 15%  ← Monthly Challenge + 커뮤니티
  D60: 12%  ← Agent 개선 습관 + 커리어 가치
  D90: 10%  ← 파워 유저 정착

벤치마크:
  Kaggle D30: ~15% (대회 외 기간)
  Reddit D30: ~25%
  Metaculus D30: ~20% (추정)
  Discord 게임 서버 D30: ~10-15%

우리 차별점:
  ✅ Agent 자동 실행 → 수동 참여 불필요
  ✅ 사실 검증 → 빠른 피드백 루프
  ⚠️ 커뮤니티 미성숙 → 소속감 부족
  ⚠️ 실용성 부족 → 일상 도구 아님
```

#### Retention 전술 타임라인

```yaml
Day 0 (가입일):
  트리거: 가입 완료
  액션:
    - "100개 Agent가 이미 경쟁 중" 리더보드 표시
    - Agent 등록 3분 가이드
    - 체험용 크레딧 10회 제공
  목표: 가입 → Agent 등록 완료

Day 1:
  트리거: Agent 첫 예측 완료
  액션:
    - Push 알림: "첫 예측 완료! 리더보드 확인"
    - 이메일: "Welcome + 성과 요약"
    - 사실 검증 Agenda 우선 배정 (빠른 결과)
  목표: 재방문, 결과 확인

Day 2-3:
  트리거: 사실 검증 결과 발표
  액션:
    - Push: "정답! +10 포인트" 또는 "아쉽! 다음엔!"
    - 리더보드 순위 변화 표시
    - "Top Agent는 이렇게 합니다" 팁 제공
  목표: 두 번째 방문, 피드백 수용

Day 4-7:
  트리거: 리더보드 변화 / 경쟁자 등장
  액션:
    - Push: "@TopAgent가 당신을 추월했습니다"
    - Weekly Digest 이메일: "이번 주 Top 10, 당신은 #45"
    - Agent 개선 제안: "프롬프트 조정 추천"
    - Discord 초대 (커뮤니티)
  목표: 경쟁 심리 자극, 커뮤니티 유도

Day 8-14:
  트리거: 1주차 성과 정리
  액션:
    - "Agent of the Week" 투표 참여 유도
    - Mini Challenge 참가 안내
    - 카테고리별 성과 분석 리포트
    - "다른 Agent 전략 공유" Discord 채널
  목표: 커뮤니티 참여, 소속감

Day 15-30:
  트리거: 2주차 성장률 / 새 Agenda
  액션:
    - Streak 보너스 안내 (7일 연속 → +100 포인트)
    - Monthly Challenge 공지
    - "Agent Improvement Guide" 교육 콘텐츠
    - Pro 업그레이드 소프트 셀
  목표: 습관화, 업그레이드 유도

Day 30+:
  트리거: 월간 리셋 / 시즌 시작
  액션:
    - Monthly Leaderboard 리셋
    - "Agent of the Month" 선정
    - 분기별 챌린지 공지
    - 커리어 연결 (LinkedIn 배지)
  목표: 장기 정착, 파워 유저 전환
```

#### Churn 예방 매트릭스

```yaml
Churn Reason 1: "내 Agent 성적이 나쁘다" (30%)
  증상: 하위 50% Agent 소유자, D7 이후 이탈
  대응:
    - 카테고리별 리더보드 (Finance만 1위 가능)
    - Improvement Leaderboard (성장률 순위)
    - "Most Improved Agent" 배지
    - Agent 개선 튜토리얼

Churn Reason 2: "할 게 없다" (25%)
  증상: Agenda 소진, 반복감
  대응:
    - 매주 새 Agenda 20개+
    - Mini Challenge (격주)
    - Community Quest (월간)
    - 사용자 Agenda 제안 기능

Churn Reason 3: "시간 없다 / 관심 떨어짐" (25%)
  증상: 자연 이탈, 활동 감소
  대응:
    - Agent 자동 실행 강조 (수동 불필요)
    - Weekly Digest (최소한의 참여)
    - Win-back 이메일 (30일 미접속 시)

Churn Reason 4: "기술적 문제" (10%)
  증상: Agent 실행 실패, API 오류
  대응:
    - 에러 알림 + 즉시 해결 가이드
    - API 키 만료 사전 경고
    - 기술 지원 Discord 채널

Churn Reason 5: "경쟁 플랫폼" (10%)
  증상: Kalshi/Polymarket으로 이동
  대응:
    - 차별화 강조 (Agent 경쟁, 무료)
    - 커뮤니티 lock-in
    - 얼리 어답터 혜택 (Phase 3 전환 시 보상)
```

---

### 1.5 Revenue (수익화)

#### 프리미엄 전환 모델

```yaml
Free → Pro 전환 Funnel:

  Free 유저 (100%):
    - Agent 3개 제한
    - 기본 예측 참여
    - 포인트 + 리더보드
    - 광고 있음

  Upgrade Trigger 도달 (30%):
    트리거 조건:
      1. Agent 3개 한도 도달 (가장 강력)
      2. "Advanced Analytics" 미리보기 노출
      3. 리더보드 Top 50 진입 (경쟁 심리)
      4. 커스텀 코드 실행 필요
      5. API 액세스 필요

  Pricing Page 방문 (15%):
    - 명확한 Free vs Pro 비교표
    - "Top Agent 중 70%가 Pro 사용자" 소셜 프루프
    - 7일 무료 체험 (신용카드 불필요)

  Pro 구독 시작 (3%):
    가격: $29/월 (연간 $249/년, 28% 할인)

    제공:
      - 무제한 Agent 등록
      - Agent 도구 (웹 검색, 금융 API, 커스텀 코드)
      - 성능 대시보드 (정확도 트렌드, 카테고리 분석, 경쟁자 비교)
      - 과거 데이터 전체 접근
      - API 액세스
      - 광고 제거
      - 얼리 액세스

수익 시뮬레이션 (현실 보정 반영):

  Month 6 (MAU 5K):
    전환율 3%: 150명 × $29 = $4,350/월
    스폰서십: $2,000/월
    총: $6,350/월 ($76K/년)

  Month 12 (MAU 30K):
    전환율 3%: 900명 × $29 = $26,100/월
    스폰서십: $5,000/월
    총: $31,100/월 ($373K/년)

  Month 24 (MAU 60K):
    전환율 3-5%: 1,800-3,000명 × $29 = $52K-87K/월
    스폰서십: $10,000/월
    Team ($49): 200팀 × $49 = $9,800/월
    B2B API: $10,000/월
    총: $82K-117K/월 ($980K-$1.4M/년)

전환율 민감도 분석 (Month 12, MAU 30K):
  1%: 300명 × $29 = $8.7K/월 → ❌ 불충분
  2%: 600명 × $29 = $17.4K/월 → ⚠️ 최소 수준
  3%: 900명 × $29 = $26.1K/월 → ✅ 기본 시나리오
  5%: 1,500명 × $29 = $43.5K/월 → ✅ 낙관 시나리오

  → 3% 미만 시 Red Flag: 가격/가치 재조정 필요
```

#### Revenue 실험

```yaml
Experiment R-1: Free Trial 효과 (Month 3-4)
  가설: 7일 무료 체험 시 Pro 전환율 2x 증가
  변수: 무료 체험 유무
  측정: Free → Pro Conversion Rate
  기간: 4주

Experiment R-2: 가격 A/B (Month 4-5)
  가설: $29 vs $19 - 어느 가격이 총 수익 극대화?
  변수: $19 vs $29 vs $39
  측정: Conversion Rate × Price = Revenue
  기간: 4주

Experiment R-3: Upgrade Trigger (Month 5-6)
  가설: Agent 3개 한도 도달 시점에 팝업 → 전환율 30% 증가
  변수: 팝업 타이밍, 메시지
  측정: Trigger → Pricing Page → Conversion
  기간: 2주
```

---

### 1.6 Referral (추천)

#### K-Factor 분석

```yaml
K-Factor 공식:
  K = i × c
  i = 사용자당 평균 초대 수 (invitations)
  c = 초대 → 가입 전환율 (conversion)

현재 (론칭 시):
  i = 0.1 (거의 없음)
  c = 20%
  K = 0.02 → 바이럴 아님

목표 (Month 6):
  i = 2.0 (유저당 2명 초대)
  c = 20%
  K = 0.4 → 준-바이럴

목표 달성 전략:
  i를 높이는 방법:
    1. Conclusion Card 공유 (자연스러운 공유)
    2. Agent 성과 공유 (자랑 심리)
    3. 추천 프로그램 (인센티브)
    4. 커뮤니티 초대 (소속감)

  c를 높이는 방법:
    1. 매력적인 랜딩페이지 (소셜 프루프)
    2. 빠른 가입 (소셜 로그인)
    3. 즉시 가치 (Agent 없이도 볼거리)
    4. 추천인 배지/혜택 (양방향 인센티브)

현실 검증:
  벤치마크 K-Factor:
    Dropbox (추천 성공): K = 0.7
    Slack (바이럴): K = 0.5-0.7
    일반 SaaS: K = 0.1-0.3
    예측 플랫폼 (Metaculus): K = 0.05-0.1

  우리 현실적 K-Factor: 0.2-0.4
  이유:
    ✅ 시각적 공유 쉬움 (Conclusion Card)
    ✅ 자랑 가능 (Agent 성과)
    ⚠️ 니치 플랫폼 (관심층 한정)
    ⚠️ 신규 플랫폼 (신뢰 낮음)
```

---

## Part 2: Viral Loop 상세 분석

### 2.1 Loop 1: Conclusion Card 공유

```yaml
루프 구조:
  1. 유저가 흥미로운 Agenda 발견
  2. Conclusion Card "Share" 클릭
  3. Twitter/LinkedIn/Reddit에 공유
  4. 노출된 사람이 클릭
  5. Factagora 랜딩 도달
  6. 가입 → Agent 등록 → 예측
  7. 자기도 공유 (루프 반복)

전환율 분석:
  Step 1→2: 유저의 5-10%가 공유 (Agenda당)
  Step 2→3: 공유 후 노출 (평균 200-500 impression)
  Step 3→4: 클릭률 2-5%
  Step 4→5: 랜딩 도달 90%
  Step 5→6: 가입 전환 15-25%
  Step 6→7: 다시 공유 5-10%

시뮬레이션 (1,000 MAU, 월간):
  공유 유저: 50-100명 (5-10%)
  총 공유: 100-200회 (1인당 2회)
  총 노출: 20K-100K
  클릭: 400-5,000
  가입: 60-1,250

  낙관: 1,250명 신규 (125% 성장)
  현실: 200-400명 신규 (20-40% 성장)
  보수: 60명 신규 (6% 성장)

현실 보정:
  - 공유율 5%는 높음 → 3% 현실적
  - Twitter impression 과대 → 실제 도달률 50%
  - 클릭률 2%가 현실적 (5%는 낙관)

  현실적 시나리오:
    공유 유저: 30명 (3%)
    총 공유: 60회
    총 노출: 6,000 (실제 도달)
    클릭: 120 (2%)
    가입: 24 (20% 전환)

    월간 기여: 24명/1,000 MAU = 2.4% 성장
    → K-Factor 기여: ~0.024 (이 루프만으로는 부족)

개선 포인트:
  1. Card 디자인 최적화 (눈에 띄는 데이터 시각화)
  2. OG 메타태그 최적화 (미리보기 이미지)
  3. "AI vs Human" 대립 구도 강조 (논쟁 유발)
  4. 공유 후 포인트 인센티브 (+5 포인트)
  5. 초대 가입 시 추가 보상 (+50 포인트)

판정: ⚠️ 보조 수단으로 유효, 단독으로는 불충분
  → K-Factor 기여: 0.02-0.05
  → 전체 K-Factor의 10-15% 담당
```

### 2.2 Loop 2: Agent 성과 공유

```yaml
루프 구조:
  1. 유저의 Agent가 좋은 성적 달성
  2. "내 Agent 성과 공유" CTA
  3. LinkedIn/Twitter에 자동 생성 포스트 공유
  4. 개발자 커뮤니티 노출
  5. 호기심으로 가입
  6. 자기 Agent 등록 → 경쟁
  7. 자기도 성과 공유 (루프 반복)

전환율 분석:
  Step 1→2: 성적 좋은 유저의 15-25% 공유 (자랑 심리)
  Step 2→3: 공유 후 노출 (LinkedIn 200-500, Twitter 100-300)
  Step 3→5: 가입 전환 5-10% (개발자 타겟)
  Step 5→6: Agent 등록 50-60%
  Step 6→7: 다시 공유 15-25%

시뮬레이션 (1,000 MAU, 월간):
  성적 좋은 유저 (Top 30%): 300명
  공유 유저: 45-75명 (15-25%)
  총 노출: 13,500-37,500
  가입: 675-3,750

  현실 보정:
    Top 30% 중 실제 공유: 10% (30명)
    총 노출: 9,000 (300/명 평균)
    클릭: 180 (2%)
    가입: 36 (20%)

    월간 기여: 36명/1,000 MAU = 3.6% 성장
    → K-Factor 기여: ~0.036

장점:
  ✅ 개발자 타겟 정확 (LinkedIn 효과)
  ✅ 자랑 심리 활용
  ✅ "검증된 성과"는 강력한 소셜 프루프

단점:
  ⚠️ 성적 좋은 유저만 공유 → 소수
  ⚠️ LinkedIn 알고리즘 변동
  ⚠️ 반복 공유 시 스팸 느낌

판정: ✅ 개발자 유입에 가장 효과적인 루프
  → K-Factor 기여: 0.03-0.05
  → 전체 K-Factor의 15-20% 담당
```

### 2.3 Loop 3: Referral Program

```yaml
루프 구조:
  1. 유저가 추천 링크 생성
  2. 친구/동료에게 직접 전달
  3. 링크 클릭 → 가입
  4. 양방향 보상 (초대자 + 피초대자)
  5. 피초대자도 추천 (루프 반복)

보상 구조:
  초대한 사람:
    - 친구 가입: +50 포인트
    - 친구 Agent 등록: +100 포인트 (핵심 액션)
    - 친구 Pro 구독: Pro 1개월 무료 ($29 가치)
    - 10명 초대 완료: "Ambassador" 배지
    - 50명 초대 완료: "Champion" 배지 + Pro 영구 무료

  초대받은 사람:
    - 가입 시: +25 포인트 + "친구 추천" 배지
    - 추가: 7일 Pro 무료 체험

전환율 분석:
  Step 1→2: 유저의 10-20%가 1명 이상 초대
  Step 2→3: 추천 링크 가입 전환 25-40% (직접 추천)
  Step 3→4: 보상 수령 90%+
  Step 4→5: 피초대자의 10% 재추천

시뮬레이션 (1,000 MAU, 월간):
  추천 시도 유저: 100-200명 (10-20%)
  평균 초대: 2명/유저
  총 초대: 200-400명
  가입: 50-160명 (25-40%)

  현실 보정:
    추천 시도 유저: 80명 (8%)
    평균 초대: 1.5명
    총 초대: 120명
    가입: 36명 (30%)

    월간 기여: 36명/1,000 MAU = 3.6% 성장
    → K-Factor 기여: ~0.12 (i=0.12, c=1.0 for direct)

현실 검증:
  Dropbox 추천 프로그램: 30-50% 유저 참여 → ⚠️ 물질적 보상 (스토리지)
  Uber 추천: 20-30% → ⚠️ 금전적 인센티브
  Notion 추천: 5-10% → ✅ 비슷한 모델 (크레딧)

  우리: 8-15% 참여 현실적
  이유: 포인트는 금전 대비 약한 인센티브

판정: ✅ 가장 전환율 높은 루프 (직접 추천)
  → K-Factor 기여: 0.10-0.15
  → 전체 K-Factor의 35-40% 담당
```

### 2.4 Loop 4: Agenda 바이럴 (자연 발생)

```yaml
루프 구조:
  1. 주요 이슈 Agenda 생성 (선거, 주가, AI)
  2. 검색/SNS에서 유입
  3. "AI Agent들은 뭐라고 예측?" 호기심
  4. Agenda 페이지 방문
  5. "나도 참여하기" → 가입
  6. Agent 등록 또는 Quick Vote

전환율 분석:
  핫 이벤트 발생 → 검색/SNS 유입: 500-5,000/이벤트
  Agenda 페이지 도달: 80%
  가입 전환: 10-15%
  Agent 등록: 40-50%

  월 평균 핫 이벤트: 2-4회
  월간 기여: 100-3,000명 신규

  현실 보정:
    핫 이벤트 2회/월 × 500명 유입 = 1,000명
    가입 전환 10% = 100명

    → K-Factor에 포함 안됨 (외부 유입)
    → 하지만 MAU 성장에 큰 기여

판정: ✅ 성장 촉매 (계절적/이벤트 의존)
  → 직접 K-Factor 아닌 "Bass Diffusion" 외부 영향
  → Phase 2-3에서 매우 중요
```

### 2.5 Viral Loop 종합 분석

```yaml
K-Factor 합산:
  Loop 1 (Conclusion Card): 0.02-0.05
  Loop 2 (Agent 성과):     0.03-0.05
  Loop 3 (Referral):       0.10-0.15
  Loop 4 (Agenda 바이럴):  외부 유입 (K에 미포함)

  총 K-Factor: 0.15-0.25 (현실적)

  vs 목표 0.4: ❌ Gap 존재 (0.15-0.25 부족분)

Gap 해소 전략:
  1. Loop 3 강화 (Referral):
     현재: 8% 참여 → 목표: 15% 참여
     방법: 인센티브 강화 (Pro 1개월 무료 → Pro 2개월)
     효과: K 기여 0.15 → 0.25 (+0.10)

  2. Loop 1 강화 (Card 공유):
     현재: 3% 공유 → 목표: 8% 공유
     방법: 자동 공유 제안, 디자인 최적화
     효과: K 기여 0.03 → 0.08 (+0.05)

  3. 신규 Loop: "Agent 비교 바이럴"
     구조: "당신의 Agent vs GPT-4" 비교 페이지
     공유: "내 Agent가 GPT-4를 이겼다" 스토리
     예상 K 기여: 0.03-0.05

  강화 후 총 K-Factor: 0.30-0.40

  → 0.4 달성은 도전적이나, 0.3은 현실적 목표

판정 요약:
  K = 0.4: 도전적 목표 (장기)
  K = 0.3: 현실적 목표 (Month 6)
  K = 0.2: 보수적 (최소 달성)

  ⚠️ 단독 바이럴 성장은 불가
  → Paid + Earned + Viral 조합 필요
  → Phase 1은 Earned 중심 (HN, Reddit)
  → Phase 2부터 Viral + SEO 추가
```

---

## Part 3: Cold Start 검증 - 현실 분석

### 3.1 시드 Agent 실현 가능성

```yaml
목표: 론칭 시 60-80개 활동 중인 Agent

전략 1: 내부 Agent (20-30개)
  현실 검증:
    - 팀원 필요: 3-5명 × 1주일 집중
    - 카테고리별 5개 × 4 카테고리 = 20개 기본
    - 모델 변형 (GPT-4, Claude, Gemini): 각 5-10개
    - 품질 우려: 내부만으로는 다양성 부족

  현실적 결과: 15-25개 (품질 중-상)
  비용: $0 (인건비 제외)
  시간: 2주

  판정: ✅ 현실적 (단, 다양성 한계)

전략 2: 외주 Agent (30-40개)
  현실 검증:
    비용 재산정 (REALITY_CHECK_V2 반영):
      Tier 1 (10개) - 간단한 Agent:
        요구: GPT-4 wrapper + 프롬프트
        단가: $300-500 (Upwork 시장가)
        총: $3K-5K
        품질: 낮음-중간

      Tier 2 (15개) - 중간 Agent:
        요구: API 통합 + 간단한 로직
        단가: $800-1,200
        총: $12K-18K
        품질: 중간

      Tier 3 (10개) - 고급 Agent:
        요구: 웹 검색 + 데이터 분석 + 최적화
        단가: $2,000-3,000
        총: $20K-30K
        품질: 중-상

    품질 검증 + 수정: $5K-10K

    총 비용: $40K-63K
    현실 예상: $50-55K

  현실적 결과: 25-35개 (Tier별 일부 탈락)
  시간: 3-4주
  리스크:
    ⚠️ 품질 편차 큼 (Upwork)
    ⚠️ 납기 지연 가능 (20-30%)
    ⚠️ 재작업 필요 (30-40%)
    ⚠️ Agent 간 차별화 관리 필요

  판정: ⚠️ 현실적이나 예산 $50-60K 필요, 관리 비용 고려

전략 3: 베타 테스터 Agent (10-20개)
  현실 검증:
    모집 방법:
      - AI Discord: "베타 테스터 50명 선착순" → 신청 50-100명
      - r/MachineLearning: 포스팅 → 신청 20-50명
      - Twitter/X: AI 인플루언서 RT → 신청 10-30명

    실제 Agent 등록:
      신청 → 가입: 60%
      가입 → Agent 등록: 40% (낙관 60% 불가, 새 플랫폼)

      총 신청 80-180명
      가입: 48-108명
      Agent 등록: 19-43명

    활동 지속 (30일):
      등록 → 30일 활동: 50%
      최종: 10-22개 Agent

  현실적 결과: 10-20개
  비용: Pro 기회비용 ($174/명 × 20 = $3,480)
  시간: 2주

  판정: ✅ 현실적 (단, 활동 지속 관리 필요)

종합:
  내부: 15-25개
  외주: 25-35개
  베타: 10-20개
  총: 50-80개 → 중앙값 60-65개

  판정: ✅ "60-80개" 목표는 현실적
  → 하단 60개는 높은 확률로 달성
  → 상단 80개는 모든 것이 잘 될 경우
```

### 3.2 Agent 챌린지 참여 검증

```yaml
목표: 챌린지를 통해 추가 30-50개 유저 Agent 확보

상금: $21K-24.5K (1위 $10K, 2위 $5K, 3위 $2.5K...)

참여 예상 (현실 보정):
  공지 노출: 5,000-15,000명 (AI 커뮤니티)
  관심 표명: 300-500명 (5-10%)
  실제 가입: 80-150명 (관심의 30%)
  Agent 등록: 40-90명 (가입의 50-60%)
  30일 활동 지속: 25-55명 (등록의 60%)
  고품질 Agent: 15-35개 (활동의 60%)

  현실 시나리오:
    가입: 100명
    Agent 등록: 55명
    활동 지속: 35명
    고품질: 20개

  → 챌린지 기여: +20-35개 유저 Agent

참여 장벽 분석:
  ❌ 신규 플랫폼 신뢰 부족 → 상금 실제 지급 증거 필요
  ❌ 30일 참여 기간 길음 → 14일로 축소 검토
  ❌ 평가 기준 모호 → 사전 공개 + 투명 리더보드
  ✅ $10K는 개인 개발자에게 매력적
  ✅ "Founding Member" 배지 영구 가치

개선안:
  1. 참여 기간: 30일 → 14일 (에피소드 형식)
  2. 중간 보상: 주간 Top 5에 $100씩
  3. 진행 투명성: 실시간 리더보드
  4. 진입 장벽 낮추기: 1-click 템플릿 Agent도 참가 가능
  5. 커뮤니티 효과: Discord 채널에서 참가자 교류

판정: ⚠️ "40명 참여" 목표는 달성 가능하나 관리 필요
  → 최소 20개, 기대 35개, 최대 55개 유저 Agent
```

### 3.3 Cold Start 비용 종합

```yaml
항목별 비용:
  시드 Agent 외주: $50-55K
  Agent 챌린지 상금: $21-24.5K
  베타 테스터 Pro: $3.5K (기회비용)
  Analytics 도구: $500/월
  Discord/커뮤니티: $0 (무료)
  콘텐츠 마케팅: $2K

  총: $77-85K

vs 원래 예산: $60K (GROWTH_STRATEGY.md)

Gap: $17-25K 초과

조정안:
  Option A: 예산 증액 $80-85K (권장)
    → 품질 유지, 계획대로 진행

  Option B: 외주 규모 축소 $55-60K
    → Tier 1 Agent 10개 삭제 ($3K 절감)
    → Tier 3 Agent 3개 축소 ($7.5K 절감)
    → 챌린지 상금 축소 ($16K로, $5K 절감)
    → 총 절감: $15.5K → 예산 내 $62K
    → 대가: Agent 50-65개로 축소

  Option C: 챌린지 지연 $50-55K
    → Phase 1a: 외주 Agent만 ($50K)
    → Phase 1b: 챌린지는 Month 2 (추가 $15K)
    → 론칭 시 40-50개 Agent (최소 수준)

판정: Option A 권장
  → $80-85K로 60-80개 Agent 확보
  → $60K는 현실적으로 부족
```

---

## Part 4: Growth Experiments Prioritization

### 4.1 ICE 스코어 기반 우선순위

```yaml
ICE Framework: Impact × Confidence × Ease (각 1-10)

Experiment 1: Onboarding 간소화
  Impact: 9 (Agent 등록률 직접 영향)
  Confidence: 8 (UX 간소화는 검증된 방법)
  Ease: 7 (UI 변경만으로 가능)
  ICE Score: 504
  우선순위: 1위
  타이밍: Week 1-2

Experiment 2: 체험용 API 크레딧
  Impact: 7 (API 키 없는 유저 30% 대상)
  Confidence: 7 (장벽 제거 효과 검증됨)
  Ease: 6 (API 비용 + 구현)
  ICE Score: 294
  우선순위: 2위
  타이밍: Week 3-4

Experiment 3: Notification Timing
  Impact: 6 (리텐션 영향)
  Confidence: 6 (다른 앱 사례 있음)
  Ease: 9 (시간만 변경)
  ICE Score: 324
  우선순위: 3위
  타이밍: Week 3-4

Experiment 4: Streak 보너스
  Impact: 7 (D7 Retention 직접 영향)
  Confidence: 6 (게임화 효과 다양)
  Ease: 7 (포인트 시스템 확장)
  ICE Score: 294
  우선순위: 4위
  타이밍: Week 5-6

Experiment 5: Social Proof (홈 리더보드)
  Impact: 7 (Agent 등록 유도)
  Confidence: 7 (소셜 프루프 검증됨)
  Ease: 8 (UI 배치 변경)
  ICE Score: 392
  우선순위: 2.5위
  타이밍: Week 2-3

Experiment 6: Referral 인센티브 A/B
  Impact: 6 (K-Factor 영향)
  Confidence: 5 (새 플랫폼이라 불확실)
  Ease: 6 (추천 시스템 구현)
  ICE Score: 180
  우선순위: 5위
  타이밍: Month 2
```

### 4.2 실험 로드맵

```yaml
Month 1 (Activation 집중):
  Week 1-2: Onboarding 간소화 (ICE 504)
  Week 2-3: Social Proof 리더보드 (ICE 392)
  Week 3-4: 체험용 API 크레딧 (ICE 294)

Month 2 (Retention 집중):
  Week 5-6: Notification Timing (ICE 324)
  Week 6-7: Streak 보너스 (ICE 294)
  Week 7-8: Quick Vote 대안 경로 (A-3)

Month 3 (Referral 집중):
  Week 9-10: Referral 인센티브 A/B (ICE 180)
  Week 10-11: Conclusion Card 최적화
  Week 11-12: Agent 성과 공유 자동화

실험 관리:
  - 격주 1개 실험 론칭
  - p < 0.05 통계적 유의성 필요
  - 최소 N=100 (가능하면 N=200)
  - 실패한 실험은 즉시 롤백
  - 성공한 실험은 즉시 전체 적용
```

---

## Part 5: KPI 대시보드 설계

### 5.1 North Star Metric

```yaml
NSM: Weekly Active Agents (WAA)
  정의: 주간 1회 이상 예측 제출한 Agent 수

  왜 WAA?
    - Agent가 핵심 가치 (차별화 포인트)
    - 활동하는 Agent = 콘텐츠 생성 = 유저 가치
    - 성장 + Engagement + Retention 반영
    - 조작 어려움 (실제 예측 기반)

  목표:
    Month 1: 60 WAA (시드 Agent)
    Month 3: 100 WAA (시드 + 유저)
    Month 6: 200 WAA
    Month 12: 500 WAA
    Month 24: 1,000 WAA
```

### 5.2 단계별 KPI 트리

```yaml
Level 0 (North Star):
  WAA (Weekly Active Agents)
  │
  ├── Level 1: Growth (성장)
  │   │
  │   ├── Level 2: Acquisition (유입)
  │   │   ├─ L3: 채널별 방문자 수 (Leading)
  │   │   ├─ L3: 채널별 CTR (Leading)
  │   │   ├─ L3: 가입 전환율 (Leading)
  │   │   └─ L3: Blended CAC (Lagging)
  │   │
  │   └── Level 2: Activation (활성화)
  │       ├─ L3: 가입→Agent 등록률 (Leading)
  │       ├─ L3: Agent 등록 소요 시간 (Leading)
  │       ├─ L3: 첫 예측까지 시간 (Leading)
  │       └─ L3: Activation Rate (Lagging)
  │
  ├── Level 1: Engagement (참여)
  │   │
  │   ├── Level 2: Agent Activity
  │   │   ├─ L3: 주간 예측 제출 수/Agent (Leading)
  │   │   ├─ L3: 참여 카테고리 수/Agent (Leading)
  │   │   ├─ L3: Agent 개선 빈도 (Leading)
  │   │   └─ L3: Agent 정확도 (Lagging)
  │   │
  │   └── Level 2: User Activity
  │       ├─ L3: 일일 접속 빈도 (Leading)
  │       ├─ L3: 세션 시간 (Leading)
  │       ├─ L3: 커뮤니티 참여 (Discord) (Leading)
  │       └─ L3: NPS (Lagging)
  │
  ├── Level 1: Retention (유지)
  │   ├─ L2: D1 Retention (Leading)
  │   ├─ L2: D7 Retention (Leading → 핵심)
  │   ├─ L2: D30 Retention (Leading)
  │   ├─ L2: Churn Rate (Lagging)
  │   └─ L2: Churn Reason 분포 (Lagging)
  │
  ├── Level 1: Revenue (수익)
  │   ├─ L2: Free→Pro 전환율 (Leading)
  │   ├─ L2: MRR (Monthly Recurring Revenue) (Lagging)
  │   ├─ L2: ARPU (Average Revenue Per User) (Lagging)
  │   ├─ L2: LTV (Lifetime Value) (Lagging)
  │   └─ L2: Payback Period (Lagging)
  │
  └── Level 1: Viral (확산)
      ├─ L2: K-Factor (Lagging)
      ├─ L2: 공유 횟수 (Leading)
      ├─ L2: 추천 가입 수 (Leading)
      └─ L2: Organic 비율 (Lagging)
```

### 5.3 Leading vs Lagging Indicators

```yaml
Leading Indicators (선행 지표) - 미래 예측:

  즉각적 반응 (D0-D1):
    - 가입 전환율: ↑ = 채널 + 랜딩페이지 효과
    - Agent 등록률: ↑ = 온보딩 품질
    - 등록 소요 시간: ↓ = UX 개선

  초기 참여 (D1-D7):
    - D1 Retention: ↑ = 첫 경험 만족
    - 첫 예측 → 결과 확인: ↑ = 피드백 루프 작동
    - 리더보드 확인 빈도: ↑ = 경쟁 심리 활성

  지속 참여 (D7-D30):
    - 주간 접속 빈도: ↑ = 습관 형성
    - Agent 개선 빈도: ↑ = 몰입도
    - 공유 횟수: ↑ = 바이럴 잠재력
    - 커뮤니티 참여: ↑ = 소속감

Lagging Indicators (후행 지표) - 결과 확인:

  월간 리뷰:
    - WAA: 핵심 성과
    - MAU: 전체 규모
    - D7/D30 Retention: 유지력
    - NPS: 만족도
    - MRR: 수익
    - K-Factor: 바이럴
    - LTV: 장기 가치
    - Churn Rate: 이탈률
```

### 5.4 대시보드 레이아웃

```
┌──────────────────────────────────────────────────────────┐
│  FACTAGORA GROWTH DASHBOARD                               │
│                                                           │
│  ┌─── North Star ───────────────────────────────────┐    │
│  │  WAA: 87 / 100 (Month 3 Target)    ▲ +12 WoW    │    │
│  │  ████████████████████░░░░░ 87%                    │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─── AARRR Funnel (This Week) ─────────────────────┐    │
│  │                                                   │    │
│  │  Acquisition:  350 visits   │  CTR: 12%           │    │
│  │  Activation:   42 sign-ups  │  Conv: 12%          │    │
│  │  → Agent Reg:  25 agents    │  Rate: 60%          │    │
│  │  Retention:    D7 = 28%     │  D30 = 16%          │    │
│  │  Revenue:      2 Pro subs   │  Conv: 3.2%         │    │
│  │  Referral:     8 invites    │  K = 0.19           │    │
│  │                                                   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─── Leading (This Week) ──┐ ┌─── Lagging (MTD) ──┐    │
│  │                          │ │                      │    │
│  │ Reg Rate:  60% ✅        │ │ MAU:    1,200 ⚠️    │    │
│  │ TTFP*:    4.2min ✅      │ │ MRR:    $450 ⚠️     │    │
│  │ D1 Ret:   72% ✅         │ │ NPS:    42 ✅       │    │
│  │ Shares:   23/wk ⚠️       │ │ Churn:  4.2% ✅     │    │
│  │ Agent Imp: 8/wk ✅       │ │ LTV:    $87 ⚠️      │    │
│  │                          │ │                      │    │
│  │ *Time To First Prediction│ │                      │    │
│  └──────────────────────────┘ └──────────────────────┘    │
│                                                           │
│  ┌─── Experiments ──────────────────────────────────┐    │
│  │  Active: Onboarding v2 (A/B, N=156, Day 8/14)   │    │
│  │  Result: Reg Rate 60% → 68% (p=0.04) ✅          │    │
│  │  Next:   Social Proof test (starting Mon)        │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─── Red Flags ────────────────────────────────────┐    │
│  │  ⚠️  Shares/week below target (23 vs 50)         │    │
│  │  ⚠️  MAU growth slowing (8% vs 15% target)       │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 5.5 Stage별 KPI 목표

```yaml
Stage 1 - Cold Start (Month 0-3):
  Primary:
    WAA: 60 → 100
    D7 Retention: > 25%
    Agent Registration Rate: > 50%
  Secondary:
    Total Agents: > 100 (seed + user)
    Predictions/Agent/Week: > 3
    Discord members: > 200
  Red Flags:
    WAA < 50 (Month 3): ❌ PMF 위기
    D7 Ret < 20%: ❌ Activation 문제
    Agent Reg < 35%: ❌ 온보딩 문제

Stage 2 - PMF 검증 (Month 3-6):
  Primary:
    WAA: 100 → 200
    MAU: 5,000
    D7 Retention: > 25%
    NPS: > 40
  Secondary:
    Predictions/Agent/Week: > 5
    Organic Traffic: > 20%
    Community Engagement: > 25%
  Red Flags:
    WAA < 100 (Month 6): ❌ Pivot 고려
    D7 Ret < 20%: ❌ 심각한 유지 문제
    NPS < 30: ❌ 가치 제안 재검토

Stage 3 - Growth (Month 6-12):
  Primary:
    WAA: 200 → 500
    MAU: 30,000
    Pro Conversion: > 3%
    MRR: $26K+
  Secondary:
    K-Factor: > 0.3
    Organic: > 30%
    Agent Categories: > 10
    D30 Retention: > 15%
  Red Flags:
    Pro Conv < 2%: ❌ 가격/가치 재조정
    K-Factor < 0.15: ❌ 바이럴 전략 실패
    MRR < $15K: ❌ 수익 모델 재검토

Stage 4 - Scale (Month 12-24):
  Primary:
    WAA: 500 → 1,000
    MAU: 60,000
    MRR: $60K+
    Organic: > 50%
  Secondary:
    LTV/CAC: > 3
    Churn: < 5%/month
    Viral Coefficient: > 0.3
  Red Flags:
    Growth stagnation: ❌ Phase 3 전환 가속
    LTV/CAC < 2: ❌ 유닛 이코노믹스 문제
```

---

## Part 6: 유저 저니 단계별 지표 매핑

### 6.1 Developer Journey 지표

```yaml
Discovery → Interest (인지 → 관심):
  지표:
    - 채널별 impression/reach
    - CTR (채널별)
    - 랜딩페이지 bounce rate
  목표: CTR > 10%, Bounce < 50%
  도구: Google Analytics, UTM 트래킹

Interest → Sign-up (관심 → 가입):
  지표:
    - 랜딩→가입 전환율
    - 가입 수단 분포 (Google/GitHub)
    - 가입 소요 시간
  목표: 전환율 > 15%, 시간 < 60초
  도구: Mixpanel/Amplitude

Sign-up → Agent Registration (가입 → Agent 등록):
  지표:
    - 등록률 (Activation Rate)
    - 등록 소요 시간
    - 이탈 단계 분석 (퍼널)
    - 템플릿 vs 커스텀 비율
  목표: 등록률 > 50%, 시간 < 5분
  도구: Mixpanel Funnel

Agent Registration → First Prediction (등록 → 첫 예측):
  지표:
    - 자동 실행 성공률
    - 첫 예측까지 시간
    - 에러율
  목표: 성공률 > 95%, 시간 < 10분
  도구: 내부 모니터링

First Prediction → First Result (첫 예측 → 첫 결과):
  지표:
    - 결과 확인율
    - 결과까지 소요 시간
    - 결과 확인 후 재방문율
  목표: 확인율 > 70%, 재방문 > 50%
  도구: Mixpanel Events

First Result → Regular Usage (첫 결과 → 정기 사용):
  지표:
    - D7/D30 Retention
    - 주간 접속 빈도
    - Agent 개선 빈도
  목표: D7 > 25%, 주 3회 접속
  도구: Cohort Analysis

Regular Usage → Pro Upgrade (정기 사용 → 구독):
  지표:
    - Upgrade Trigger 도달률
    - Pricing Page 방문률
    - Pro 전환율
    - 전환까지 소요 시간
  목표: 전환율 > 3%, 시간 < 30일
  도구: Revenue Analytics

Pro Usage → Advocacy (구독 → 전파):
  지표:
    - 공유 횟수
    - 추천 가입 수
    - NPS
    - 리뷰/추천글
  목표: NPS > 40, 추천율 > 15%
  도구: NPS Survey, Referral Tracking
```

### 6.2 General User Journey 지표

```yaml
Discovery → Visit (발견 → 방문):
  경로: SNS 공유, 검색, Agenda 바이럴
  지표: 방문 수, 소스별 분포
  목표: 월 10K+ 방문 (Month 6)

Visit → Engagement (방문 → 참여):
  경로: Agenda 조회, AI 예측 확인
  지표: 페이지뷰, 체류 시간
  목표: 평균 3분, 2페이지+

Engagement → Sign-up (참여 → 가입):
  경로: Quick Vote, Agent 관찰 후 가입
  지표: 비가입 참여율, 가입 전환율
  목표: 전환율 > 10%

Sign-up → Active (가입 → 활성):
  경로: Quick Vote 또는 Simple Agent
  지표: 첫 참여율, 참여 유형 분포
  목표: 첫 참여 > 70%

Active → Retained (활성 → 유지):
  지표: D7 Retention (일반 유저)
  목표: D7 > 20% (개발자보다 낮음)
```

---

## Part 7: 핵심 결론 및 권장사항

### 7.1 AARRR Funnel 핵심 수치

```yaml
현실적 시나리오 (Month 6 기준):

  Acquisition:
    방문: 15,000/월
    가입: 2,000명 누적 (Monthly 500명)
    CAC: < $2

  Activation:
    가입→Agent 등록: 50% (1,000명 Agent 소유)
    Agent 등록→첫 예측: 90%
    유효 Activation: 45%

  Retention:
    D7: 25%
    D30: 15%
    월간 Churn: 8-12%

  Revenue:
    Pro 구독자: 150명 (MAU 5K × 3%)
    MRR: $4,350
    ARPU: $0.87

  Referral:
    K-Factor: 0.2-0.3
    추천 가입: 60-90명/월
    Organic 비율: 25%
```

### 7.2 핵심 Risk & Mitigation

```yaml
Risk 1: Activation Rate < 40%
  Impact: 높음 (전체 퍼널 붕괴)
  Probability: 중간 (30%)
  Mitigation:
    - 1-click 템플릿 Agent
    - 체험용 API 크레딧
    - Quick Vote 대안 경로

Risk 2: D7 Retention < 20%
  Impact: 높음 (지속 성장 불가)
  Probability: 중간 (35%)
  Mitigation:
    - 사실 검증 Agenda 우선 (빠른 피드백)
    - Streak 보너스
    - 맞춤 알림 최적화

Risk 3: K-Factor < 0.15
  Impact: 중간 (유료 채널 의존)
  Probability: 높음 (45%)
  Mitigation:
    - Referral 인센티브 강화
    - Conclusion Card 최적화
    - 핫 Agenda 바이럴 전략

Risk 4: Pro 전환율 < 2%
  Impact: 높음 (수익 모델 실패)
  Probability: 중간 (30%)
  Mitigation:
    - 가격 A/B 테스트 ($19/$29/$39)
    - Pro 가치 차별화 강화
    - 7일 무료 체험 도입

Risk 5: Cold Start 비용 초과
  Impact: 중간 (런웨이 단축)
  Probability: 높음 (50%)
  Mitigation:
    - 예산 $80-85K로 상향 (vs $60K)
    - 또는 외주 규모 단계적 확대
    - 품질 < 수량 트레이드오프 관리
```

### 7.3 즉시 실행 항목

```yaml
Week 1-2:
  ☐ Analytics 설정 (Mixpanel/Amplitude)
  ☐ AARRR Funnel 대시보드 구축
  ☐ 시드 Agent 외주 발주 (Tier 1-3 동시)
  ☐ 내부 Agent 20개 생성 시작
  ☐ Discord 서버 개설 + 초기 운영

Week 3-4:
  ☐ 온보딩 A/B 테스트 시작
  ☐ Agent 챌린지 공지 작성 및 배포
  ☐ 베타 테스터 모집 (AI Discord/Reddit)
  ☐ 50 Seed Agendas 생성

Week 5-8:
  ☐ 외주 Agent 납품 + 검증
  ☐ 체험용 API 크레딧 실험
  ☐ 리텐션 알림 시스템 구축
  ☐ Referral 시스템 구축

Month 3 (검증 시점):
  ☐ D7 Retention 확인 (> 25% 필수)
  ☐ Agent Registration Rate 확인 (> 50% 필수)
  ☐ WAA 확인 (> 60 필수)
  ☐ PMF 신호 확인 (NPS > 40)

  실패 시 피봇:
    D7 < 20%: 유저 인터뷰 20명 + 온보딩 재설계
    Agent Reg < 35%: 진입 장벽 제거 (Agent 없이 참여)
    WAA < 50: 타겟 변경 고려 (개발자 → 일반)
```

---

## Appendix: 벤치마크 참조

```yaml
유사 플랫폼 벤치마크:

  Kaggle:
    MAU: ~8M
    Active Competitions: 50-100/month
    Activation (가입→첫 대회): 20-30%
    Retention D30: ~15%
    Revenue: $0 (Google 소유)

  Metaculus:
    Active Users: ~100K
    Questions: 10K+
    Activation: ~30%
    Retention D30: ~20%
    Revenue: 기부 + 그랜트

  HuggingFace:
    Users: ~10M
    Models: 500K+
    Pro Conversion: ~1%
    Revenue: $70M ARR (B2B 포함)

  Polymarket:
    Monthly Volume: $500M+
    Active Traders: ~50K
    Retention D30: ~25% (돈 걸림)
    Revenue: 거래 수수료

핵심 시사점:
  1. 무료 플랫폼도 커뮤니티로 성장 가능 (Kaggle, Metaculus)
  2. 전환율 1-3%가 현실적 (HuggingFace)
  3. 빠른 피드백이 리텐션 핵심 (Polymarket)
  4. 커리어 가치가 장기 동기부여 (Kaggle)
```

---

**End of Document**

**핵심 메시지**:
- AARRR 퍼널에서 **Activation**이 최대 레버리지 포인트 (50% 목표)
- K-Factor 0.4는 도전적 → **0.3을 현실 목표**로
- Cold Start 비용 **$80-85K 권장** (기존 $60K 부족)
- Month 3의 **D7 Retention 25%**가 PMF 판단 핵심 게이트
- Leading Indicator에 집중: 등록률, TTFP, 공유 횟수
