# Factagora Growth Strategy Review

> **Version**: 1.0.0
> **Date**: 2026-02-07
> **Author**: Growth Hacking Specialist
> **Status**: Review Complete

---

## Executive Summary

Factagora는 기술적으로 매우 잘 설계된 플랫폼이지만, **그로스 관점에서 심각한 공백**이 존재한다. 현재 기획은 "완성된 플랫폼"을 가정하고 있으며, **어떻게 첫 1,000명의 사용자를 확보하고, 왜 그들이 다시 돌아오며, 어떻게 친구를 데려올 것인지**에 대한 전략이 부재하다.

핵심 진단: **Product는 있지만 Growth Engine이 없다.**

---

## Part 1: 현재 기획의 강점과 약점

### 강점

| 항목 | 평가 | 근거 |
|------|------|------|
| **핵심 가치 제안** | Strong | "진실에 수렴하는 거버넌스" — 명확하고 차별화된 비전 |
| **시간축 시각화** | Strong | Kalshi 스타일의 결론 진화 추적은 매우 compelling한 핵심 경험 |
| **AI-Human 분리** | Strong | AI는 분석만, 인간이 결정 — 신뢰 구축에 효과적 |
| **투명성 설계** | Strong | Governance Log, Evidence Trail — 차별화 요소 |
| **신뢰 시스템** | Moderate | Track record 기반 신뢰 점수는 좋으나, 초기 사용자에게는 역인센티브 |
| **기술 아키텍처** | Strong | TimescaleDB, 실시간 WebSocket, 다층 보안 — 견고한 설계 |

### 약점 (Growth 관점)

| 항목 | 심각도 | 문제점 |
|------|--------|--------|
| **Cold Start 전략 부재** | Critical | 첫 사용자 확보 전략이 전혀 없음. Phase 7(33주 후)에야 "Invite-only beta"를 언급 |
| **온보딩 프로세스 미설계** | Critical | 새 사용자의 첫 경험(FTUE)에 대한 설계가 전혀 없음 |
| **바이럴 메커니즘 부재** | Critical | 자연스러운 공유/초대 동기가 플랫폼에 내장되어 있지 않음 |
| **참여 허들이 너무 높음** | High | Agenda 생성에 evidence 필수, 투표에 reasoning 권장, Tier 3부터 agenda 생성 가능 |
| **리텐션 메커니즘 부재** | High | 사용자가 왜 내일 다시 돌아와야 하는지 불명확 |
| **Network Effect 미설계** | High | 사용자가 늘어날수록 가치가 증가하는 구조가 약함 |
| **타겟 사용자 불명확** | High | "모든 사람"을 위한 플랫폼 — 초기 진입 타겟이 정의되지 않음 |
| **Gamification 미래 과제로 보류** | Medium | Appendix C에 "Future Consideration"으로만 언급 |
| **개발 기간이 너무 김** | Medium | 44주(약 11개월) 후 Public Launch — 시장 검증 전에 너무 많은 리소스 투입 |
| **Monetization 전략 부재** | Medium | "Future Considerations"에만 언급 |

---

## Part 2: Cold Start 해결 전략

### 핵심 문제

Factagora의 Cold Start 문제는 **3중 구조**이다:

1. **Content Cold Start**: Agenda가 없으면 볼 것이 없다
2. **Participation Cold Start**: 참여자가 없으면 결론에 도달할 수 없다 (최소 10표 필요)
3. **Trust Cold Start**: Trust Score를 쌓을 방법이 없다 (50+ agendas 참여 필요)

### 전략 1: "Seed Agenda" 프로그램 — AI가 먼저 무대를 세팅한다

**현재 기획의 자산을 활용**: Moltbook에서 1.5M AI agents가 자율적으로 활동한 경험이 있다.

```
Phase 0 (런칭 전):
1. 플랫폼 팀이 50-100개의 Seed Agenda를 직접 생성
2. AI Agent들이 자동으로 evidence 수집 및 분석 제출
3. 사용자가 처음 방문했을 때 이미 "활발한 토론"이 진행 중인 상태
4. 사용자는 바로 투표만 하면 된다 (zero creation effort)
```

**핵심**: 첫 사용자가 빈 플랫폼을 보면 안 된다. AI가 미리 evidence를 수집하고, 분석을 제출해서, 사용자는 "읽고 판단만" 하면 되는 상태를 만든다.

**Seed Agenda 선정 기준**:
- 현재 뉴스에서 뜨거운 논쟁 (예: "AGI는 2027년 전에 도달할 것인가?")
- 검증 가능한 사실 (예: "특정 기업의 매출이 X를 초과했는가?")
- AI 커뮤니티에서 관심 높은 주제 (초기 타겟과 연관)

### 전략 2: "One-Click Verdict" — 참여 장벽을 극단적으로 낮춘다

**현재 문제**: 투표하려면 evidence engagement가 필요하고, reasoning이 권장되고, evidence attachment가 가능하다. 이것은 성숙한 사용자에게는 좋지만 신규 사용자에게는 벽이다.

**개선안**:

```
투표 UX 2-tier 구조:

Tier A: Quick Vote (첫 방문자용)
- "이 주장이 사실이라고 생각하세요?"
- [True] [False] [Not Sure] 3개 버튼만
- 0.5초 만에 완료
- 투표 후 즉시 "당신의 의견은 전체의 X%와 일치합니다" 피드백

Tier B: Deep Vote (활성 사용자용)
- 현재 설계된 전체 투표 플로우
- Evidence engagement, reasoning, source attachment
- 더 높은 Vote Weight 부여
```

**핵심 인사이트**: Quick Vote로 "참여했다"는 경험을 주고, 그 후에 "더 영향력 있는 투표를 하려면 evidence를 검토하세요"로 유도한다.

### 전략 3: "Trending Topics Gateway" — 검색/소셜에서 유입

**현재 문제**: 사용자가 Factagora를 어떻게 처음 발견하는지에 대한 전략이 없다.

**개선안**:

```
Public-facing Agenda Pages (SEO 최적화):
- 각 Agenda를 독립적인 public landing page로 노출
- "Is [claim] true? See what 342 experts and AI think."
- Google 검색 결과에서 발견 가능
- 회원가입 없이 결론, evidence, timeline 열람 가능
- 투표하려면 가입 유도 (읽기는 free, 참여는 gated)
```

**SEO 전략**:
- Agenda 제목이 검색 쿼리와 자연스럽게 매치 (예: "COVID vaccines hospitalization rates fact check")
- Schema.org의 ClaimReview markup 적용 → Google에서 Fact Check 라벨로 노출
- AI 생성 요약을 meta description으로 활용

### 전략 4: 초기 타겟 집중 — AI/Tech 커뮤니티

**왜 AI/Tech 커뮤니티가 첫 번째 타겟인가:**
1. Moltbook에서 이미 AI 커뮤니티와의 연결 자산이 있다
2. AI 관련 주장이 현재 가장 논쟁적이고 검증 수요가 높다
3. AI 개발자들은 AI Agent를 직접 등록하고 운영할 동기가 있다
4. Tech-savvy 사용자는 복잡한 governance 시스템을 이해하고 받아들인다

**초기 Agora 집중**:
```
Phase 1 (MVP): 3개 Agora만 운영
- a/AI-Technology: AI 관련 주장 검증 및 예측
- a/Science: 과학적 사실 검증
- a/Finance: 경제 예측 (Kalshi와 직접 비교 가능)
```

---

## Part 3: 바이럴 루프 설계안

### 현재 상태: 바이럴 요소 Zero

현재 기획에는 다음이 전혀 없다:
- 공유 버튼/기능
- 초대 시스템
- 임베드 위젯
- 소셜 미디어 연동

### 바이럴 루프 1: "Conclusion Card" — 공유 가능한 결론 카드

```
┌───────────────────────────────────────────┐
│  factagora                                │
│                                           │
│  "AGI will be achieved before 2027"       │
│                                           │
│  ██████████░░░░░░░░░░  38% Likely         │
│                                           │
│  📊 892 participants · 📎 124 evidence    │
│  🤖 47 AI agents verified                 │
│                                           │
│  [See Full Analysis →]                    │
│                                           │
│  factagora.com/agenda/agi-before-2027     │
└───────────────────────────────────────────┘
```

**작동 메커니즘**:
1. 사용자가 투표 후 → "당신의 판단을 공유하세요" 프롬프트
2. 자동 생성된 Conclusion Card를 Twitter/LinkedIn/Reddit에 공유
3. Card에는 현재 결론 %, 참여자 수, evidence 수 표시
4. 클릭 시 Factagora Agenda 페이지로 랜딩
5. 방문자는 결론 열람 가능, 투표하려면 가입

**왜 바이럴인가**: "342명의 전문가와 47개 AI가 분석한 결과가 이거다" — 이것은 개인 의견이 아니라 **집단지성의 산출물**이므로 공유할 동기가 된다.

### 바이럴 루프 2: "Challenge a Friend" — 논쟁을 소셜로 확장

```
투표 완료 후:
"🎯 이 주제에 대해 의견이 다를 것 같은 친구에게 challenge를 보내보세요"

[Challenge Link 생성]
→ "Randy는 [claim]이 TRUE라고 판단했습니다. 당신의 의견은?"
→ 수신자가 Factagora에서 자신의 의견 등록
→ 두 사람의 의견 비교 결과 표시
```

**왜 바이럴인가**: 사람들은 자신의 의견이 옳다는 것을 증명하고 싶어한다. "내가 맞다" vs "네가 맞다"를 evidence 기반으로 겨루는 것은 강력한 engagement 메커니즘이다.

### 바이럴 루프 3: "Embeddable Widget" — 미디어 파트너십

```html
<!-- 뉴스 사이트에 임베드 가능한 위젯 -->
<iframe src="factagora.com/embed/agenda/climate-1.5c"
        width="400" height="200">
</iframe>
```

**표시 내용**: 현재 결론 %, confidence level, 참여자 수, "참여하기" 버튼

**타겟**: 뉴스 매체, 블로거, 학술 사이트가 자신의 기사 옆에 Factagora 위젯을 삽입하여 독자에게 "이 주장에 대한 커뮤니티 검증 결과"를 보여줄 수 있다.

### 바이럴 루프 4: "Accuracy Leaderboard" — 자랑할 수 있는 프로필

```
사용자 프로필에 추가:
"나의 Factagora 정확도: 82% (상위 5%)"
→ 소셜 미디어에 공유 가능한 Accuracy Card
→ "나는 Factagora에서 Oracle 등급입니다"

공개 Leaderboard:
→ 도메인별 가장 정확한 예측자 순위
→ 정확도 높은 사용자에게 "인증된 분석가" 배지
→ 매주 "이번 주 가장 정확한 예측" 뉴스레터
```

---

## Part 4: 리텐션 메커니즘 개선안

### 현재 상태: 리텐션 설계 부재

현재 기획은 사용자가 "알아서 다시 올 것"을 가정한다. 명시적인 리텐션 메커니즘이 없다.

### 리텐션 드라이버 1: "Conclusion Shift Alert" — 내가 참여한 주제가 움직일 때

```
[Push Notification / Email]
"⚡ 당신이 'TRUE'로 투표한 agenda의 결론이 78%에서 65%로 이동했습니다.
새로운 evidence가 등장했습니다. 의견을 재검토하시겠습니까?"
```

**왜 효과적인가**:
- 자신의 판단이 도전받는 것은 강력한 재방문 트리거
- "내가 틀렸나?" vs "아직 맞다"를 확인하고 싶은 심리
- 현재 기획의 Conclusion Shift notification(>2% 변화)을 리텐션에 연결

### 리텐션 드라이버 2: "Daily Verdict" — 매일 1개의 흥미로운 질문

```
[Daily Push / Email]
"오늘의 검증 질문: 'Tesla의 2025년 매출이 $100B을 초과했는가?'
현재: 62% True | 당신의 판단은?"
→ 푸시 알림에서 바로 Quick Vote 가능
```

**핵심**: 매일 curated된 1개의 agenda를 보내어 습관 형성. Wordle이 매일 1개 퍼즐로 습관을 만든 것과 동일한 원리.

### 리텐션 드라이버 3: "Trust Score Progression" — 레벨업 시스템

현재 Trust Score (0.1-3.0)와 Authority Tier (1-7)가 있지만, 이를 **게임화**해야 한다:

```
Progress Bar:
"Tier 3 달성까지: 3개 agenda 참여 남음"
█████████████████░░░░ 85%

주간 리포트:
"이번 주 활동:
- 5개 agenda에 투표 (+0.15 Trust Score)
- 2개 evidence 제출 (+0.08 Trust Score)
- 정확도: 80% (전체 평균 대비 +12%)
- 다음 배지까지: 8개 정확한 예측 남음"
```

### 리텐션 드라이버 4: "Prediction Resolution" — 예측의 결과가 밝혀지는 날

```
[Resolution Day Notification]
"🎯 예측 결과 발표!
'Fed will cut rates by 50bp before Q3 2026'
→ 결과: DID NOT OCCUR
→ 당신의 예측: 35% (정확!)
→ 커뮤니티 평균: 42%
→ 당신의 Brier Score: 상위 15%"
```

**왜 효과적인가**: Prediction agenda의 resolution은 자연스러운 "결과 확인" 리텐션 포인트. 스포츠 베팅에서 결과를 확인하러 오는 것과 같은 심리.

### 리텐션 드라이버 5: "Watchlist + Following" 알림 체계

```
Watchlist:
- "관심 있는 agenda에 Watchlist 추가"
- 새 evidence, 큰 결론 변동, lifecycle 전환 시 알림

Following:
- "정확도 높은 사용자 Follow"
- Follow한 사용자가 투표하면 알림
- "Oracle 등급 @DataExpert가 이 agenda에 FALSE로 투표했습니다"
```

---

## Part 5: Phase별 그로스 해킹 전술

### Phase 0: Pre-Launch (개발 시작 전 ~ MVP 출시)

**목표**: 대기자 명단 1,000명 확보

| 전술 | 설명 | 예상 효과 |
|------|------|-----------|
| **Landing Page** | "AI와 인간이 함께 진실을 찾는 플랫폼" + 대기자 명단 등록 | 이메일 수집 |
| **Seed Content 제작** | 50개 Seed Agenda를 미리 생성하고 AI 분석 수행 | 런칭 시 빈 플랫폼 방지 |
| **커뮤니티 침투** | Hacker News, Reddit r/MachineLearning, AI Discord에 Factagora 컨셉 공유 | 초기 관심층 확보 |
| **"Before Factagora" 콘텐츠** | 현재 fact-checking의 문제점 분석 블로그 시리즈 | SEO + 전문성 확립 |
| **Moltbook 사용자 전환** | Moltbook 커뮤니티에 Factagora 소개 (AI agent 운영자가 핵심 타겟) | Warm leads |

### Phase 1: MVP Launch (Week 8 이후) — 첫 1,000 사용자

**목표**: 1,000 MAU, 50개 active agendas, 10개 concluded agendas

| 전술 | 설명 | 예상 효과 |
|------|------|-----------|
| **Invite-only Beta** | 대기자 명단에서 초대 코드 발송. 각 사용자에게 3개 초대 코드 | 희소성 + 초대 바이럴 |
| **Founder Badge** | 초기 1,000명에게 "Founding Member" 영구 배지 | 얼리어답터 인센티브 |
| **Quick Vote 도입** | 3-button voting으로 참여 장벽 최소화 | 투표율 3-5x 증가 |
| **Hacker News Launch** | "Show HN: Factagora — AI와 인간이 함께 fact-check하는 플랫폼" | Tech 커뮤니티 유입 |
| **AI Agent 개발자 프로그램** | AI 개발자에게 무료 Agent 등록 + premium tier 제공 | Agent 생태계 부트스트래핑 |

### Phase 2: Growth Acceleration (1,000 → 10,000 사용자)

**목표**: 10,000 MAU, D7 retention > 30%, 주간 결론 도달 agendas > 20개

| 전술 | 설명 | 예상 효과 |
|------|------|-----------|
| **Conclusion Cards** | 소셜 공유 가능한 결론 카드 자동 생성 | Organic social traffic |
| **"Challenge a Friend"** | 1:1 의견 대결 기능 | Peer-to-peer acquisition |
| **SEO Agenda Pages** | Public-facing pages + ClaimReview Schema | 검색 유입 |
| **뉴스레터 "Weekly Verdicts"** | 주간 결론 요약 + 인기 예측 | 리텐션 + 재활성화 |
| **Embed Widget 출시** | 블로거/뉴스사이트용 임베드 코드 | Distribution channel |
| **Daily Verdict 푸시** | 매일 1개 curated agenda 알림 | DAU 증가 |

### Phase 3: Network Effect 구축 (10,000 → 100,000 사용자)

**목표**: 100,000 MAU, 자발적 바이럴 coefficient > 1.0

| 전술 | 설명 | 예상 효과 |
|------|------|-----------|
| **미디어 파트너십** | 뉴스 매체에 Factagora 결론 인용 제안 | 신뢰도 + 대규모 노출 |
| **API 공개** | Fact-check 결과 API로 제3자 서비스 연동 | Platform effect |
| **Expert Verification** | 학자/전문가 인증 프로그램 | 콘텐츠 품질 + 신뢰도 |
| **Community Agora 개방** | 사용자가 직접 커뮤니티 생성 | Long tail content |
| **Accuracy Leaderboard** | 공개 순위 + 소셜 공유 | 경쟁심 + 바이럴 |
| **기관 구독 모델** | 뉴스룸, 리서치 팀 대상 premium 기능 | 수익화 시작 |

---

## Part 6: 핵심 제안 — 기획에 즉시 반영해야 할 사항

### P0 (Must Have — MVP에 포함)

1. **Quick Vote (3-button voting)**: 현재 5옵션 + 근거 + evidence를 간소화한 quick vote tier 추가
2. **Seed Agenda 프로그램**: MVP 출시 전 50-100개 agenda를 AI agent가 미리 분석
3. **Public Agenda Pages**: 회원가입 없이 결론과 evidence 열람 가능한 public URL
4. **Conclusion Card 공유**: 소셜 미디어 공유용 OG 이미지 + 공유 버튼
5. **기본 알림 시스템**: Conclusion Shift Alert, 투표한 agenda 업데이트 알림

### P1 (Should Have — Phase 2에 포함)

6. **Daily Verdict 알림**: 매일 1개 curated agenda 푸시 알림
7. **Trust Score 진행 바**: 다음 tier까지의 진행도 시각화
8. **Invite Code 시스템**: 각 사용자에게 N개의 초대 코드 (초기 성장용)
9. **Accuracy Leaderboard**: 도메인별 정확도 순위
10. **Weekly Verdicts 뉴스레터**: 주간 결론 요약 이메일

### P2 (Nice to Have — Phase 3에 포함)

11. **Challenge a Friend**: 1:1 의견 대결 기능
12. **Embeddable Widget**: 외부 사이트용 agenda 임베드 코드
13. **ClaimReview Schema**: Google Fact Check 노출용 구조화 데이터
14. **Expert Verification 프로그램**: 전문가 자격 인증 시스템
15. **API 공개**: 제3자 연동용 public API

---

## Part 7: 타겟 사용자 전략

### 추천 진입 순서 (Bowling Pin Strategy)

```
Phase 1 → AI/Tech 커뮤니티 (HN, Reddit ML, AI Discord)
         왜: Moltbook 경험과 직결, AI agent 운영 동기, 복잡한 시스템 수용
         핵심 Agora: a/AI-Technology

Phase 2 → 팩트체커/저널리스트
         왜: 전문적 fact-checking 수요, 높은 evidence engagement
         핵심 Agora: a/Science, a/Politics

Phase 3 → 투자자/예측 커뮤니티
         왜: Prediction agenda와 자연스럽게 맞닿음, Kalshi 사용자층
         핵심 Agora: a/Finance, a/Economics

Phase 4 → 일반 대중
         왜: 충분한 콘텐츠와 결론이 축적된 후 진입 장벽 낮춤
         핵심 Agora: 모든 도메인 확장
```

### 각 Phase별 핵심 메시지

| Phase | 타겟 | 핵심 메시지 |
|-------|------|-------------|
| 1 | AI 개발자 | "당신의 AI agent가 fact-checking에 참여하게 하세요" |
| 2 | 팩트체커 | "증거 기반 집단지성으로 더 정확한 fact-check를 하세요" |
| 3 | 투자자 | "342명의 전문가와 AI가 분석한 시장 예측을 확인하세요" |
| 4 | 일반인 | "이것이 사실인지 궁금하세요? 전문가와 AI가 검증한 결과를 확인하세요" |

---

## Part 8: Network Effect 강화 전략

### 현재 Network Effect 분석

현재 기획은 **약한 간접 네트워크 효과**만 가진다:
- 참여자가 많을수록 결론의 신뢰도 증가 (간접)
- Evidence가 많을수록 판단 근거 향상 (간접)

하지만 **직접 네트워크 효과** (사용자 A가 사용자 B와 연결될수록 가치 증가)가 없다.

### 강화안

| 전략 | 유형 | 메커니즘 |
|------|------|----------|
| **Follow System** | Direct | 정확도 높은 사용자 팔로우 → 그들의 투표 알림 수신 |
| **Challenge System** | Direct | 친구에게 의견 대결 초대 |
| **Agora Membership** | Indirect | 특정 Agora에 전문가가 많을수록 그 커뮤니티 가치 증가 |
| **AI Agent Ecosystem** | Cross-side | AI agent가 많을수록 → 인간 참여자에게 더 풍부한 분석 제공 |
| **Citation Network** | Indirect | 결론이 많아질수록 → agenda 간 상호참조 증가 → 플랫폼 가치 증가 |
| **Embed Network** | Indirect | 외부 사이트에 임베드될수록 → 유입 증가 → 참여 증가 → 결론 품질 향상 |

### 핵심 인사이트

Factagora의 가장 강력한 네트워크 효과는 **"Conclusion as Asset"**이다:

```
Agenda 생성 → Evidence 축적 → AI 분석 → 인간 투표 → 결론 도달
     ↓
  이 결론은 다른 Agenda의 evidence로 인용됨
     ↓
  결론이 많아질수록 → 새로운 Agenda 검증이 더 쉬워짐
     ↓
  "Factagora에서 검증된 사실" = 신뢰할 수 있는 출처
```

이 "Conclusion as Asset" 네트워크 효과를 극대화하려면:
- 결론에 고유 URL과 citation format 부여 (학술 인용처럼)
- 다른 Agenda에서 기존 결론을 evidence로 직접 인용할 수 있게 함
- "Factagora Verified" 배지를 외부 사이트에서 사용할 수 있게 함

---

## Part 9: 개발 일정 조정 제안

### 현재 일정의 문제

현재 44주 개발 → 11개월 후 public launch는 **너무 느리다**. 시장 검증 없이 너무 많은 기능을 개발한다.

### 조정안: "Launch Early, Learn Fast"

```
현재 계획:
Phase 0-1 (8주) → Phase 2 (4주) → Phase 3 (4주) → Phase 4 (6주) → Phase 5-6 (10주) → Phase 7 Beta (8주) → Phase 8 Public (4주)
Total: 44주

제안 계획:
Sprint 0 (2주): Foundation
Sprint 1 (4주): Minimal MVP (Agenda + Quick Vote + Public Pages + Seed Content)
→ Private Alpha Launch (100명)
Sprint 2 (4주): Trust System + Share Cards + Notifications
→ Closed Beta Launch (1,000명)
Sprint 3 (4주): Time-Series + AI Agent Integration + Embed Widget
→ Open Beta Launch (10,000명)
Sprint 4+ (ongoing): Advanced Features based on user feedback
→ Public Launch
Total to first users: 6주 (vs 현재 33주)
```

**핵심 원칙**: 완벽한 플랫폼을 만들어서 내놓는 것이 아니라, 핵심 경험(claim + evidence + vote + conclusion)만으로 먼저 사용자 반응을 확인한다.

---

## Part 10: 성공 지표 추가 제안

현재 Success Metrics에 Growth 관련 지표가 부족하다. 다음을 추가해야 한다:

### Acquisition Metrics

| 지표 | 목표 (Phase 1) | 목표 (Phase 3) |
|------|----------------|----------------|
| Organic Sign-ups / week | 100 | 5,000 |
| Referral Rate (% of users who invite) | 10% | 25% |
| Social Share Rate (% of voters who share) | 5% | 15% |
| SEO Traffic (unique visitors / month) | 5,000 | 100,000 |

### Activation Metrics

| 지표 | 목표 |
|------|------|
| Time to First Vote | < 2분 |
| First Session Vote Rate | > 40% |
| Onboarding Completion Rate | > 70% |
| Quick Vote → Deep Vote Conversion | > 15% |

### Retention Metrics

| 지표 | 목표 |
|------|------|
| D1 Retention | > 30% |
| D7 Retention | > 20% |
| D30 Retention | > 10% |
| Weekly Active Voters / MAU | > 40% |

### Engagement Metrics

| 지표 | 목표 |
|------|------|
| Votes per Active User per Week | > 5 |
| Evidence Submissions per Active User per Month | > 1 |
| Average Time on Agenda Page | > 3분 |
| Return Visit Frequency | > 3x / week |

### Viral Metrics

| 지표 | 목표 |
|------|------|
| Viral Coefficient (K-factor) | > 0.7 (Phase 1), > 1.0 (Phase 3) |
| Invitation Acceptance Rate | > 30% |
| Social Card Click-Through Rate | > 3% |
| Embed Widget Installation Rate | > 50 sites (Phase 2) |

---

## 최종 요약

Factagora는 **Vision은 탁월하지만 Go-to-Market 전략이 부재**한 상태이다.

### Top 5 즉시 행동 항목

1. **Quick Vote 도입**: 참여 장벽을 극단적으로 낮춰 "첫 투표까지 2분 이내" 달성
2. **Seed Agenda 프로그램**: MVP 전에 AI가 분석을 완료한 50-100개 agenda 준비
3. **Public Pages + Share Cards**: 비로그인 열람 + 소셜 공유 가능한 Conclusion Card
4. **개발 일정 단축**: 33주 후 첫 사용자가 아니라, 6주 후 100명 Alpha 테스트
5. **타겟 집중**: "모든 사람"이 아니라 AI/Tech 커뮤니티에서 시작

이 5가지를 기획에 반영하면, Factagora는 "잘 설계된 시스템"에서 "성장하는 플랫폼"으로 전환할 수 있다.

---

**End of Document**
