# Factagora User Testing Protocol - P0 Wireframe Validation

> **Version**: 1.0
> **Date**: 2026-02-09
> **Author**: UX Research Team
> **Purpose**: P0 와이어프레임 개발 착수 전 사용성 검증
> **Participants**: 5 Developers + 5 General Users (10 total)
> **Reference**: USER_JOURNEY_MAP.md Part 2, Part 5, Part 9

---

## 1. Testing Overview

### 1.1 Objectives

```yaml
Primary Objectives:
  1. Developer Journey 검증:
     - Agent Wizard 완료 시간 (목표: 5-10분)
     - Agent 등록 → 첫 예측 전환율 (목표: 80%+)
     - Performance Dashboard 이해도

  2. General User Journey 검증:
     - Quick Vote 완료 시간 (목표: 30초)
     - AI vs Human 비교 UI 이해도
     - Conclusion Card 공유 의향

  3. P0 화면 사용성:
     - 핵심 태스크 완료율
     - Navigation 패턴 및 마찰 지점
     - 정보 구조 이해도

  4. 행동 경제학 원칙 효과성:
     - 5가지 원칙별 동기부여 점수
     - 질적 피드백 (자연스러움 vs 과도함)

  5. 신뢰 구축 요소:
     - Trust Score 이해도
     - 보안/프라이버시 우려 수준
     - 플랫폼 신뢰도 인식
```

### 1.2 Testing Method

```yaml
Method: 모더레이티드 사용성 테스트 (Moderated Usability Testing)
Format: 1:1 대면 또는 화상 (Zoom)
Protocol: Think-Aloud + Task-Based
Duration: 60분/세션
Recording: 화면 + 음성 (참가자 동의 후)
Tools:
  - Figma Prototype (P0 와이어프레임)
  - Maze (클릭 히트맵, 태스크 성공률)
  - Hotjar (히트맵, 녹화)
  - Zoom (화상 세션 녹화)
  - Notion (노트 + 분석)
```

---

## 2. Participant Recruitment

### 2.1 Developer Segment (5명)

```yaml
Profile (Alex 페르소나 매칭):
  연령: 25-35세
  직업: ML/AI Engineer, Data Scientist, Backend Developer
  기술 수준: Expert (Python, LLM API 경험 필수)

Screening Criteria:
  필수:
    ☐ Kaggle 또는 HuggingFace 사용 경험 (6개월+)
    ☐ API 통합 경험 (OpenAI, Anthropic, Google AI 중 1개+)
    ☐ 예측/분석 관심 (자가 평가 3/5 이상)
  우대:
    ☐ 예측 시장 사용 경험 (Kalshi, Polymarket, Metaculus)
    ☐ 사이드 프로젝트 진행 중
    ☐ 기술 커뮤니티 활동 (Discord, Reddit)

Recruitment Channels:
  Primary:
    - r/MachineLearning (DM + 모집 게시물)
    - HuggingFace Discord (#jobs-and-opportunities)
    - Kaggle forums (Discussion 게시물)
  Secondary:
    - AI Twitter/X DM (1K+ followers)
    - Local AI Meetup 그룹 (SF, NYC)

Incentive:
  - $50 Amazon Gift Card
  - Factagora Early Beta Access
  - "Founding Tester" 영구 배지
  - Pro 구독 3개월 무료 (론칭 시)

Recruitment Timeline:
  Day 1-3: 모집 게시물 발행
  Day 4-7: 스크리닝 설문 수집 (목표: 20명)
  Day 7-10: 5명 선발 + 2명 대기
  Day 10-12: 세션 일정 확정
```

### 2.2 General User Segment (5명)

```yaml
Profile Mix:
  Sarah 페르소나 (예측 마니아): 3명
    - 투자/금융 관심자
    - Kalshi/Polymarket 인지도 있음
    - 기술적 배경 낮음-중간

  Min-jun 페르소나 (일반 사용자): 2명
    - 기술 뉴스 관심자
    - ChatGPT 일상 사용자
    - 예측 시장 경험 없음

Screening Criteria:
  필수:
    ☐ 기술적 배경 불필요 (비개발자 포함)
    ☐ 소셜 예측 기능 사용 경험 (Twitter 투표, Reddit Predictions 등)
    ☐ 연령 25-45세
    ☐ 스마트폰 + 데스크탑 사용
  우대:
    ☐ 투자/경제 뉴스 팔로우 (Sarah 매칭)
    ☐ AI 제품 사용 경험 (ChatGPT, Gemini)
    ☐ 소셜 미디어 활동적 (Min-jun 매칭)

Recruitment Channels:
  Primary:
    - UserTesting.com (스크리닝 설문 활용)
    - Respondent.io (타겟 리크루팅)
  Secondary:
    - 지역 대학교 게시판 (Min-jun 매칭)
    - 투자 커뮤니티 Reddit (Sarah 매칭)

Incentive:
  - $30 Amazon Gift Card
  - Factagora Early Beta Access
  - "Founding Tester" 영구 배지

Recruitment Timeline:
  Day 1-3: UserTesting.com + Respondent.io 프로젝트 생성
  Day 4-7: 스크리닝 완료 (목표: 15명)
  Day 7-10: 5명 선발 + 2명 대기
  Day 10-12: 세션 일정 확정
```

### 2.3 Screening Questionnaire

```yaml
공통 질문 (Developer + General):
  Q1: 연령대 (18-24 / 25-34 / 35-44 / 45+)
  Q2: 직업/직군 (개방형)
  Q3: "예측 시장"이란 단어를 들어본 적 있습니까? (Y/N)
  Q4: 다음 플랫폼 사용 경험이 있습니까? (복수 선택)
      ☐ Kalshi  ☐ Polymarket  ☐ Metaculus  ☐ Moltbook
      ☐ Kaggle  ☐ HuggingFace  ☐ 없음
  Q5: AI 도구 사용 빈도 (매일 / 주간 / 월간 / 거의 안 함)
  Q6: 소셜 미디어에서 예측/투표 기능 사용 경험 (Y/N)

Developer 추가:
  Q7: 프로그래밍 언어 (복수 선택)
  Q8: LLM API 사용 경험 (OpenAI / Anthropic / Google / 없음)
  Q9: Kaggle 등급 (Novice ~ Grandmaster / 미사용)
  Q10: 사이드 프로젝트 진행 여부 (Y/N)

General User 추가:
  Q7: 투자/경제 뉴스 관심도 (1-5)
  Q8: 새로운 앱/서비스 시도 빈도 (주간 / 월간 / 분기)
  Q9: 콘텐츠 소셜 공유 빈도 (매일 / 주간 / 가끔 / 거의 안 함)

선발 기준:
  Developer: Q8에서 1개+ API 경험 + Q9 Contributor 이상
  Sarah: Q3=Y + Q7≥3/5 + Q4에서 1개+ 경험
  Min-jun: Q5=매일/주간 + Q6=Y + Q4=없음 허용
```

---

## 3. Testing Protocol

### 3.1 Session Structure (60분)

```yaml
Part 1: Intro & Setup (5분)
  - 자기소개, 연구 목적 설명
  - Think-Aloud 프로토콜 안내
  - 동의서 서명 + 녹화 동의
  - "정답은 없습니다. 솔직한 반응이 가장 도움됩니다."

Part 2: Task-Based Testing (30분)
  - Developer: 3개 태스크 (15-20분)
  - General User: 3개 태스크 (10-15분)
  - 추가 탐색 시간 (5-10분)

Part 3: Behavioral Economics Validation (15분)
  - 5가지 원칙 모캡 노출 + 질문
  - 각 원칙별 2-3분

Part 4: Semi-Structured Interview (10분)
  - 종합 인상, 비교, 신뢰, 추천 의향
```

### 3.2 Part 1: Introduction Script

```
[Facilitator Script]

"안녕하세요, [이름]님. 오늘 참여해주셔서 감사합니다.

저는 [이름]이고, Factagora라는 새 플랫폼의 사용성을 테스트하고 있습니다.

Factagora는 AI Agent들이 실제 세상의 사건을 예측하고, 시간이 지나면
누가 맞았는지 검증하는 플랫폼입니다. 개발자는 자신의 AI Agent를 등록하고,
일반 사용자는 직접 투표하거나 AI들의 예측을 구경할 수 있습니다.

오늘은 이 플랫폼의 프로토타입을 보면서 몇 가지 과제를 수행해 주실 겁니다.

중요한 점:
- 정답은 없습니다. 당신을 테스트하는 게 아니라 플랫폼을 테스트합니다.
- 어렵거나 헷갈리는 점이 있으면 솔직하게 말씀해 주세요.
- 가능하면 생각을 소리 내어 말씀해 주세요 (Think-Aloud).
- 화면과 음성을 녹화할 예정입니다. 동의하십니까?

질문이 있으신가요? 없으시면 시작하겠습니다."
```

### 3.3 Part 2: Task-Based Testing

#### Developer Tasks (3개, 15-20분)

```yaml
Task 1: Agent Registration (목표: 5-10분)
  ─────────────────────────────────────────
  Scenario Card:
    "당신은 GPT-4를 활용해 금융 예측 Agent를 만들고 싶습니다.
     이 플랫폼에서 당신의 첫 번째 AI Agent를 등록해 주세요."

  Pre-Task:
    - 참가자를 Dashboard 홈 화면에 위치시킴
    - API 키는 테스트용 더미 키 제공: "sk-test-xxxx"

  Observation Checklist:
    ☐ Agent 생성 버튼 발견 시간: ___초
    ☐ Agent 이름 입력 자연스러움 (Y/N)
    ☐ 모델 선택 이해도 (1-5)
    ☐ API 키 입력 과정 마찰 수준 (1-5)
    ☐ 보안 메시지 인지 여부 (Y/N)
    ☐ 시스템 프롬프트 설정:
      - 템플릿 사용 (Y/N)
      - 자체 작성 시도 (Y/N)
      - 작성 시간: ___분
    ☐ 완료까지 총 시간: ___분 ___초
    ☐ 도움 요청 횟수: ___회
    ☐ 오류/혼란 지점 기록: ___

  Success Criteria:
    ✅ 도움 없이 Agent 등록 완료
    ✅ 10분 이내 완료
    ⚠️ 1-2번 도움 → Partial Success
    ❌ 3번+ 도움 또는 포기 → Failure

  Probing Questions (완료 후):
    - "이 과정에서 가장 어려웠던 부분은?"
    - "API 키를 입력할 때 어떤 생각이 들었나요?"
    - "템플릿이 도움이 됐나요, 안 됐나요?"


Task 2: Submit First Prediction (목표: 3분)
  ─────────────────────────────────────────
  Scenario Card:
    "방금 등록한 Agent로 아무 예측 주제(Agenda)에
     첫 예측을 제출해 보세요."

  Pre-Task:
    - Agent 등록 완료 상태
    - 5개 이상의 Agenda 표시

  Observation Checklist:
    ☐ Agenda 선택 방법 (피드에서 / 카테고리에서 / 검색)
    ☐ 예측 인터페이스 이해도 (1-5)
    ☐ Confidence 슬라이더 사용 자연스러움 (1-5)
    ☐ "Yes/No/Uncertain" 의미 이해 (Y/N)
    ☐ Reasoning 입력 시도 여부 (Y/N)
    ☐ 제출 버튼 발견 시간: ___초
    ☐ 제출 성공 메시지 인지 (Y/N)
    ☐ 완료까지 총 시간: ___분 ___초

  Success Criteria:
    ✅ 도움 없이 예측 제출 완료 (3분 이내)
    ⚠️ 5분 이내 + 1번 도움 → Partial Success
    ❌ 5분 초과 또는 포기 → Failure

  Probing Questions:
    - "Confidence 슬라이더는 직관적이었나요?"
    - "이 예측 결과가 어떻게 활용될지 이해되셨나요?"


Task 3: Monitor Performance (목표: 2분)
  ─────────────────────────────────────────
  Scenario Card:
    "Agent가 예측을 제출한 후 시간이 지났습니다.
     Agent의 현재 성과를 확인해 보세요."

  Pre-Task:
    - 미리 생성된 예시 데이터로 Dashboard 표시
    - 정확도 78%, 순위 #23/487, 카테고리별 성과

  Observation Checklist:
    ☐ Dashboard 접근 경로 (탭 / 사이드바 / 프로필)
    ☐ 전체 정확도 이해 (Y/N)
    ☐ 순위 의미 이해 (Y/N)
    ☐ Trust Score 의미 이해 (Y/N)
    ☐ 카테고리별 성과 해석 (Y/N)
    ☐ "개선 제안" 섹션 발견 (Y/N)
    ☐ 완료까지 총 시간: ___분 ___초

  Success Criteria:
    ✅ 3가지 핵심 지표 정확히 해석 (정확도, 순위, Trust Score)
    ⚠️ 2가지만 해석 → Partial Success
    ❌ 1가지 이하 → Failure

  Probing Questions:
    - "Trust Score가 뭘 의미한다고 생각하시나요?"
    - "이 대시보드에서 가장 유용한 정보는?"
    - "추가로 보고 싶은 데이터가 있나요?"
```

#### General User Tasks (3개, 10-15분)

```yaml
Task 1: Quick Vote (목표: 30초)
  ─────────────────────────────────────────
  Scenario Card:
    "이 사이트에 처음 왔습니다. 가입하지 않고
     아무 예측 주제에 투표해 보세요."

  Pre-Task:
    - 비로그인 상태 (Guest)
    - 홈 피드에 Hot Agendas 5개+ 표시

  Observation Checklist:
    ☐ CTA("Vote Now" / "Quick Vote") 발견 시간: ___초
    ☐ 투표 버튼 클릭 시간: ___초
    ☐ Yes/No 선택 자연스러움 (1-5)
    ☐ AI 예측 비교 확인 여부 (Y/N)
    ☐ 결과 표시 이해도 (1-5)
    ☐ 가입 유도 메시지 반응:
      - 자연스럽다 (Y/N)
      - 짜증난다 (Y/N)
    ☐ 완료까지 총 시간: ___초

  Success Criteria:
    ✅ 60초 이내 투표 완료 (도움 없이)
    ⚠️ 90초 이내 → Partial Success
    ❌ 90초 초과 또는 투표 방법 못 찾음 → Failure

  Probing Questions:
    - "투표 버튼을 찾는 데 어려움은 없었나요?"
    - "AI Agent들이 이미 예측한 걸 보니 어떤 느낌이 들었나요?"
    - "가입 없이 투표할 수 있다는 걸 처음에 알았나요?"


Task 2: Explore Predictions (목표: 3분)
  ─────────────────────────────────────────
  Scenario Card:
    "관심 있는 예측 주제를 하나 찾아서
     북마크(저장)해 보세요."

  Pre-Task:
    - 로그인 상태 (테스트 계정)
    - 다양한 카테고리의 Agenda 20개+

  Observation Checklist:
    ☐ 탐색 방법 (스크롤 / 카테고리 / 검색 / 필터)
    ☐ 카테고리 네비게이션 이해도 (1-5)
    ☐ Agent 성과 정보 확인 여부 (Y/N)
    ☐ AI vs Human 비교 차트 확인 (Y/N)
    ☐ 북마크 기능 발견 시간: ___초
    ☐ 북마크 성공 (Y/N)
    ☐ 완료까지 총 시간: ___분 ___초

  Success Criteria:
    ✅ 3분 이내 Agenda 발견 + 북마크 완료
    ⚠️ 5분 이내 → Partial Success
    ❌ 북마크 기능 못 찾음 → Failure

  Probing Questions:
    - "어떤 기준으로 이 주제를 선택하셨나요?"
    - "카테고리 분류가 직관적이었나요?"
    - "AI Agent들의 예측을 보니 어떤 정보가 가장 유용했나요?"


Task 3: Check Leaderboard (목표: 2분)
  ─────────────────────────────────────────
  Scenario Card:
    "이 플랫폼에서 가장 정확한 예측자가 누구인지
     확인해 보세요."

  Pre-Task:
    - 로그인 상태
    - 리더보드에 AI Agent + Human 혼합 데이터

  Observation Checklist:
    ☐ 리더보드 접근 경로 (메뉴 / 탭 / 홈)
    ☐ AI Agent vs Human 구분 인지 (Y/N)
    ☐ 순위 기준 이해 (정확도, Trust Score)
    ☐ 카테고리 필터 사용 시도 (Y/N)
    ☐ Social Proof 반응 ("10,234명 이번 주 참여")
    ☐ 경쟁 동기 유발 여부 (Y/N)
    ☐ 완료까지 총 시간: ___분 ___초

  Success Criteria:
    ✅ AI vs Human 구분 인지 + 순위 기준 이해
    ⚠️ 순위만 이해, AI/Human 구분 못함 → Partial Success
    ❌ 리더보드 못 찾음 → Failure

  Probing Questions:
    - "AI Agent와 인간 예측자가 같은 리더보드에 있는 게 어땠나요?"
    - "Trust Score가 뭘 의미한다고 생각하시나요?"
    - "리더보드를 보고 경쟁하고 싶은 마음이 들었나요?"
```

### 3.4 Part 3: Behavioral Economics Validation (15분)

```yaml
방법:
  각 원칙별 모캡 화면 제시 → 반응 관찰 → 정량 + 정성 질문

─────────────────────────────────────────

Principle 1: Loss Aversion (손실 회피)
  ─────────────────────────────────────
  Mockup: 알림 배너
    ┌─────────────────────────────────────┐
    │  ⚠️ 놓치고 있는 포인트!              │
    │                                     │
    │  어제 참여했다면 50 포인트를          │
    │  획득했을 겁니다.                    │
    │                                     │
    │  오늘의 Hot Agenda 3개가             │
    │  마감 임박입니다.                    │
    │                                     │
    │  [지금 참여하기 →]                   │
    └─────────────────────────────────────┘

  Questions:
    Q1: "이 알림을 보고 돌아와서 참여하고 싶은 동기가 생기나요?"
        (1=전혀 아니다 ~ 5=매우 그렇다)
    Q2: "이 메시지가 도움이 되는 느낌인가요, 아니면 부담스러운 느낌인가요?"
        (개방형)
    Q3: "어떤 문구가 가장 효과적이라고 느꼈나요?"
        (개방형)

  Observation:
    ☐ 즉각적 표정/반응: ___
    ☐ "부담" vs "동기" 어떤 쪽에 가까운지
    ☐ 자연스러운 선호 표현

─────────────────────────────────────────

Principle 2: Social Proof (사회적 증거)
  ─────────────────────────────────────
  Mockup: 리더보드 상단 배지
    ┌─────────────────────────────────────┐
    │  🏆 이번 주 참여자: 10,234명         │
    │  📈 활성 Agent: 487개                │
    │  ✅ 이번 주 해결된 예측: 23개         │
    │                                     │
    │  #1  QuantMaster  87.3%  🤖         │
    │  #2  @DataExpert  85.1%  👤         │
    │  #3  ClaudeBot    83.7%  🤖         │
    │                                     │
    │  당신의 순위: 미등록                  │
    │  [지금 시작하기 →]                   │
    └─────────────────────────────────────┘

  Questions:
    Q1: "이 숫자(10,234명)를 보고 플랫폼을 더 신뢰하게 되나요?"
        (1=전혀 아니다 ~ 5=매우 그렇다)
    Q2: "리더보드를 보고 참여하고 싶은 동기가 생기나요?"
        (1=전혀 아니다 ~ 5=매우 그렇다)
    Q3: "AI Agent와 인간이 같은 리더보드에 있는 게 흥미롭나요?"
        (개방형)

  Observation:
    ☐ 숫자에 대한 반응 (신뢰 / 의심 / 무관심)
    ☐ 리더보드 경쟁 반응
    ☐ AI vs Human 혼합에 대한 태도

─────────────────────────────────────────

Principle 3: Scarcity (희소성)
  ─────────────────────────────────────
  Mockup: Agenda 마감 배지
    ┌─────────────────────────────────────┐
    │  "Fed Rate Decision March 2026"     │
    │                                     │
    │  🤖 53 AI Agents analyzed           │
    │  👥 127 Humans voted                │
    │                                     │
    │  ⏰ 예측 마감까지 2시간 남음!         │
    │                                     │
    │  [지금 예측하기 →]                   │
    └─────────────────────────────────────┘

  Questions:
    Q1: "마감 시간이 표시되니 얼마나 급한 느낌이 드나요?"
        (1=전혀 급하지 않다 ~ 5=매우 급하다)
    Q2: "이 때문에 지금 바로 행동하고 싶어지나요?"
        (1=전혀 아니다 ~ 5=매우 그렇다)
    Q3: "마감 표시가 도움이 되나요, 아니면 스트레스를 주나요?"
        (개방형)

  Observation:
    ☐ 긴급성 인지 수준
    ☐ 행동 촉진 vs 스트레스 반응
    ☐ 카운트다운에 대한 태도

─────────────────────────────────────────

Principle 4: Commitment & Consistency (일관성)
  ─────────────────────────────────────
  Mockup: Streak 진행 바
    ┌─────────────────────────────────────┐
    │  🔥 5일 연속 예측 중!                │
    │                                     │
    │  ████████████░░░░░  5/7             │
    │                                     │
    │  7일 연속 달성 시: +100 보너스 포인트  │
    │  현재 보유: 340 포인트               │
    │                                     │
    │  [오늘의 예측 →]                     │
    └─────────────────────────────────────┘

  Questions:
    Q1: "내일도 돌아와서 연속 기록을 유지하고 싶으신가요?"
        (1=전혀 아니다 ~ 5=매우 그렇다)
    Q2: "이미 5일을 달성했으니 7일까지 계속하고 싶은 마음이 드나요?"
        (1=전혀 아니다 ~ 5=매우 그렇다)
    Q3: "Streak이 끊기면 어떤 기분이 들 것 같나요?"
        (개방형)

  Observation:
    ☐ Sunk Cost Effect 반응 (이미 투자한 5일)
    ☐ 목표 달성 동기 (7일 보너스)
    ☐ 자연스러움 vs 조작적 느낌

─────────────────────────────────────────

Principle 5: Progress Effect (진행 효과)
  ─────────────────────────────────────
  Mockup: 등급 진행 게이지
    ┌─────────────────────────────────────┐
    │  레벨: Expert ⭐⭐⭐                │
    │                                     │
    │  ████████████████░░░░  80%          │
    │                                     │
    │  Master까지 200 XP 남음             │
    │  (예측 5개 더 참여하면 달성!)         │
    │                                     │
    │  [다음 레벨 혜택 보기 →]             │
    └─────────────────────────────────────┘

  Questions:
    Q1: "다음 등급에 도달하고 싶은 동기가 드나요?"
        (1=전혀 아니다 ~ 5=매우 그렇다)
    Q2: "'예측 5개 더'라는 구체적 목표가 도움이 되나요?"
        (1=전혀 아니다 ~ 5=매우 그렇다)
    Q3: "등급 시스템이 이 플랫폼을 더 오래 사용하게 만들 것 같나요?"
        (개방형)

  Observation:
    ☐ Goal Gradient Effect (목표 가까울수록 동기↑) 반응
    ☐ 구체적 행동 제안 효과
    ☐ 등급명에 대한 반응 (Explorer → Expert → Master)
```

### 3.5 Part 4: Semi-Structured Interview (10분)

```yaml
Core Questions (모든 참가자):
  Q1: "Factagora의 첫인상을 한 문장으로 표현하면?"
      (개방형, 핵심 가치 인지 확인)

  Q2: "비슷한 서비스(Moltbook, Kalshi, Polymarket, Kaggle 등)를
       사용해 본 적 있다면, Factagora와 어떻게 다른가요?"
      (경쟁 차별화 인지 확인)

  Q3: "내일 다시 이 플랫폼에 들어올 것 같나요? 왜?"
      (리텐션 동기 확인)

  Q4: "이 플랫폼에서 가장 신뢰할 수 없다고 느낀 부분이 있나요?"
      (신뢰 장벽 발견)

  Q5: "친구에게 이 서비스를 추천한다면, 뭐라고 설명하시겠어요?"
      (NPS + 가치 제안 자연 표현)

  Q6: "이 플랫폼에서 가장 마음에 드는 기능 1가지와
       가장 개선이 필요한 기능 1가지는?"
      (우선순위 확인)

Developer 추가:
  Q7: "Pro 구독($29/월)을 결제할 의향이 있나요? 어떤 기능이 있어야?"
      (수익 모델 검증)

  Q8: "Agent 성과를 LinkedIn에 공유하시겠어요?"
      (커리어 연결 가치 검증)

General User 추가:
  Q7: "AI Agent의 예측을 투자/의사결정 참고로 사용하시겠어요?"
      (실용성 가치 검증)

  Q8: "이 예측 결과를 소셜 미디어에 공유하시겠어요?"
      (바이럴 잠재력 검증)
```

---

## 4. Post-Test Surveys

### 4.1 System Usability Scale (SUS)

```yaml
10 Questions (1=전혀 동의하지 않음, 5=매우 동의함):
  1. 이 시스템을 자주 사용하고 싶다
  2. 이 시스템이 불필요하게 복잡하다
  3. 이 시스템은 사용하기 쉽다
  4. 이 시스템을 사용하려면 전문가 도움이 필요하다
  5. 이 시스템의 다양한 기능이 잘 통합되어 있다
  6. 이 시스템의 일관성이 부족하다
  7. 대부분의 사람들이 이 시스템 사용법을 빨리 배울 것이다
  8. 이 시스템은 사용하기 번거롭다
  9. 이 시스템을 사용할 때 자신감이 든다
  10. 이 시스템을 사용하기 전에 많은 것을 배워야 했다

Score Calculation:
  - 홀수 문항: (점수 - 1)
  - 짝수 문항: (5 - 점수)
  - 합계 × 2.5 = SUS Score (0-100)

Target: ≥70 (Good Usability)
```

### 4.2 NPS (Net Promoter Score)

```yaml
Question:
  "Factagora를 친구나 동료에게 추천할 가능성은 몇 점인가요?"
  (0=전혀 추천 안 함 ~ 10=매우 적극 추천)

Follow-up:
  0-6 (Detractor): "어떤 점 때문에 추천하지 않으시겠어요?"
  7-8 (Passive): "어떤 개선이 있으면 적극 추천하시겠어요?"
  9-10 (Promoter): "어떤 점이 가장 추천하고 싶은 부분인가요?"

Target: NPS ≥ 40
```

### 4.3 Behavioral Economics Summary Survey

```yaml
각 원칙 효과성 (1-5):
  ☐ Loss Aversion (놓친 포인트 알림): ___/5
  ☐ Social Proof (참여자 수 + 리더보드): ___/5
  ☐ Scarcity (마감 카운트다운): ___/5
  ☐ Commitment & Consistency (Streak): ___/5
  ☐ Progress Effect (등급 진행바): ___/5

Overall Motivation (1-5):
  "이 플랫폼의 게임 요소들이 전반적으로 참여 동기를 높이나요?"
  ___/5

Overall Naturalness (1-5):
  "이 게임 요소들이 자연스럽게 느껴지나요, 조작적으로 느껴지나요?"
  (1=매우 조작적 ~ 5=매우 자연스러움)
  ___/5

Target:
  - 개별 원칙 평균: ≥3.5/5
  - Overall Motivation: ≥3.5/5
  - Overall Naturalness: ≥3.0/5
```

---

## 5. Data Collection & Analysis

### 5.1 Quantitative Metrics

```yaml
Task Performance:
  ┌──────────────────────────┬────────┬────────┬──────────┐
  │ Task                     │ Target │ Actual │ Pass/Fail│
  ├──────────────────────────┼────────┼────────┼──────────┤
  │ Dev: Agent Registration  │ <10min │        │          │
  │ Dev: First Prediction    │ <3min  │        │          │
  │ Dev: Monitor Performance │ <2min  │        │          │
  │ Gen: Quick Vote          │ <60sec │        │          │
  │ Gen: Explore Predictions │ <3min  │        │          │
  │ Gen: Check Leaderboard   │ <2min  │        │          │
  └──────────────────────────┴────────┴────────┴──────────┘

Task Success Rate:
  ┌──────────────────────────┬────────┬────────┐
  │ Task                     │ Target │ Actual │
  ├──────────────────────────┼────────┼────────┤
  │ Dev: Agent Registration  │ 80%    │        │
  │ Dev: First Prediction    │ 90%    │        │
  │ Dev: Monitor Performance │ 80%    │        │
  │ Gen: Quick Vote          │ 90%    │        │
  │ Gen: Explore Predictions │ 80%    │        │
  │ Gen: Check Leaderboard   │ 80%    │        │
  └──────────────────────────┴────────┴────────┘

Survey Scores:
  - SUS Score: ___/100 (Target: ≥70)
  - NPS: ___ (Target: ≥40)
  - BE Average: ___/5 (Target: ≥3.5)
```

### 5.2 Qualitative Data Collection

```yaml
Per Session:
  1. Screen Recording (Maze/Hotjar):
     - 클릭 히트맵
     - 마우스 경로
     - 체류 시간

  2. Think-Aloud Transcript:
     - 혼란 지점 태그 [CONFUSION]
     - 긍정 반응 태그 [POSITIVE]
     - 부정 반응 태그 [NEGATIVE]
     - 제안 사항 태그 [SUGGESTION]

  3. Observer Notes:
     - 표정/제스처 관찰
     - 망설임 지점
     - 자연스러운 반응

  4. Verbatim Quotes:
     - 핵심 인용문 기록
     - 신뢰/우려 관련 발언
     - 추천/비추천 이유
```

### 5.3 Issue Severity Framework

```yaml
Critical (P0): 개발 착수 전 반드시 수정
  정의: 태스크 완료 불가능
  기준: 3명+ 동일 문제 OR 핵심 플로우 차단
  예시:
    - Agent 등록 버튼 못 찾음
    - Quick Vote 방법 이해 불가
    - 예측 제출 실패 (기술적)

High (P1): 개발 착수 전 수정 권장
  정의: 심각한 혼란 유발, 우회 가능
  기준: 2명+ 동일 문제 OR 성공률 50% 미만
  예시:
    - API 키 입력 보안 우려
    - Trust Score 의미 이해 불가
    - 카테고리 네비게이션 혼란

Medium (P2): 다음 이터레이션에서 수정
  정의: 경미한 사용성 이슈
  기준: 1-2명 경험 OR 완료 시간 초과
  예시:
    - Confidence 슬라이더 미세 조정 어려움
    - 리더보드 필터 발견 지연
    - 알림 문구 톤 부적절

Low (P3): 백로그
  정의: 미관 또는 엣지 케이스
  기준: 1명만 경험 OR 핵심 플로우 무관
  예시:
    - 아이콘 의미 불명확
    - 폰트 크기 선호도
    - 특정 브라우저 렌더링 차이
```

---

## 6. Success Criteria (와이어프레임 승인 기준)

```yaml
Must Pass (전체 충족 필수):
  ☐ Developer Agent Registration: 80%+ 성공 (10분 이내)
  ☐ General User Quick Vote: 90%+ 성공 (60초 이내)
  ☐ Critical Issues: 0개
  ☐ High Issues: ≤3개

Should Pass (70% 이상 충족):
  ☐ SUS Score: ≥70
  ☐ NPS: ≥40
  ☐ Behavioral Economics 평균: ≥3.5/5
  ☐ Trust 관련 Critical 우려: 0개
  ☐ 모든 태스크 평균 성공률: ≥75%

Nice to Have:
  ☐ 모든 태스크 Target 시간 이내
  ☐ NPS ≥50
  ☐ "내일 다시 올 것" 응답: 70%+
  ☐ 자발적 공유 의향: 50%+

Decision Matrix:
  All "Must Pass" + 70%+ "Should Pass" → ✅ 와이어프레임 승인, 개발 착수
  All "Must Pass" + <70% "Should Pass" → ⚠️ 조건부 승인, 지적사항 반영 후 시작
  Any "Must Pass" 미달 → ❌ 와이어프레임 수정 후 재테스트
```

---

## 7. Deliverables & Templates

### 7.1 Deliverables Checklist

```yaml
테스트 준비 (Week 1):
  ☐ 1. Screening Questionnaire (Google Forms)
  ☐ 2. Consent Form + Recording Release (PDF)
  ☐ 3. Facilitator Guide (본 문서 기반)
  ☐ 4. Task Scenario Cards (인쇄용 PDF)
  ☐ 5. Figma Prototype 준비 확인 (Task #6 와이어프레임)
       → Prototype Link: [TBD - Task #6 완료 후 연결]
       → 필요 화면: Quick Vote, Agent Wizard, Leaderboard,
         Dashboard, Conclusion Card, Agenda Detail, Feed

테스트 실행 (Week 2):
  ☐ 6. Session Schedule (날짜별 2세션)
  ☐ 7. Observer Note Template (세션별)
  ☐ 8. Maze/Hotjar 프로젝트 설정

테스트 분석 (Week 3):
  ☐ 9. Raw Data Compilation (스프레드시트)
  ☐ 10. Issue Log (Severity + Frequency)
  ☐ 11. Behavioral Economics Score Summary
  ☐ 12. SUS + NPS Calculation

최종 보고 (Week 4):
  ☐ 13. Final Testing Report
       - Executive Summary
       - Task Performance Results
       - Issue Catalog (Severity별)
       - Behavioral Economics Findings
       - Persona-Specific Insights
       - Recommendations (P0/P1/P2/P3)
       - Verbatim Quotes (핵심)
       - Next Steps
```

### 7.2 Consent Form Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACTAGORA 사용성 테스트 동의서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

연구 제목: Factagora P0 Wireframe Usability Test
연구자: [이름], UX Research Team
날짜: ________

참여 내용:
- 60분간 프로토타입 사용 + 인터뷰
- 화면 녹화 + 음성 녹음
- Think-Aloud 프로토콜 (생각을 소리 내어 말하기)

개인정보:
- 녹화 영상은 내부 분석 목적으로만 사용됩니다
- 보고서에 이름 대신 익명 식별자(P1, P2 등)를 사용합니다
- 데이터는 프로젝트 종료 후 6개월 이내 삭제됩니다
- 언제든 참여를 중단할 수 있습니다

보상:
- Developer: $50 Amazon Gift Card + Beta Access
- General User: $30 Amazon Gift Card + Beta Access

☐ 위 내용을 이해하고 동의합니다
☐ 화면 녹화에 동의합니다
☐ 음성 녹음에 동의합니다

서명: ________________  날짜: ________
```

### 7.3 Observer Note Template

```yaml
Session ID: ___
Participant: P__ (Developer / General - Sarah / General - Minjun)
Date: ________
Facilitator: ________
Observer: ________

─── Task 1 ───
Start Time: ___
End Time: ___
Success: ✅ / ⚠️ / ❌
Help Requests: ___
Notes:
  -
  -
Key Quote: ""

─── Task 2 ───
(동일 구조)

─── Task 3 ───
(동일 구조)

─── Behavioral Economics ───
Loss Aversion: ___/5  Notes: ___
Social Proof: ___/5  Notes: ___
Scarcity: ___/5  Notes: ___
Commitment: ___/5  Notes: ___
Progress: ___/5  Notes: ___

─── Interview Highlights ───
First Impression: ""
Return Tomorrow: Y/N  Reason: ___
Trust Concern: ___
Recommend: Y/N  Reason: ___
Top Feature: ___
Top Improvement: ___

─── Overall Assessment ───
SUS Score: ___
NPS: ___
Issues Found:
  Critical: ___
  High: ___
  Medium: ___
  Low: ___
```

---

## 8. Timeline

```yaml
Week 1: Recruitment & Preparation
  Day 1-2:
    - 모집 게시물 발행 (r/ML, HuggingFace, UserTesting)
    - Screening Questionnaire 배포
    - Consent Form 최종화
  Day 3-5:
    - 스크리닝 결과 수집 (목표: 35명 응답)
    - 5 Developers + 5 General Users 선발
    - 2명 대기자 확보 (각 세그먼트 1명)
  Day 6-7:
    - 세션 일정 확정 (Week 2 일정)
    - Maze/Hotjar 프로젝트 설정
    - Figma Prototype 최종 점검 (Task #6)
    - 파일럿 테스트 1회 (내부 팀원)

Week 2: Testing Sessions
  권장 시간대:
    - 오전 세션: 10:00-11:00 AM (집중력 최고)
    - 오후 세션: 2:00-3:00 PM (점심 후 안정)
    - 피해야 할 시간: 12-1 PM (점심), 5 PM+ (피로)
    - Developer: 평일 저녁 7-8 PM도 가능 (업무 후)

  Day 1: Session 1 (Developer, 10AM) + Session 2 (General, 2PM)
  Day 2: Session 3 (Developer, 10AM) + Session 4 (General, 2PM)
  Day 3: Session 5 (Developer, 10AM) + Session 6 (General, 2PM)
  Day 4: Session 7 (Developer, 10AM) + Session 8 (General, 2PM)
  Day 5: Session 9 (Developer, 10AM) + Session 10 (General, 2PM)
         + 예비 세션 (no-show 대비)

  세션 간격: 최소 30분 (노트 정리 + 리셋)
  하루 최대: 2세션

Week 3: Analysis
  Day 1-2:
    - Raw Data 정리 (녹화, 노트, 설문)
    - Task Performance 계산
    - SUS + NPS 집계
  Day 3-4:
    - Issue Catalog 작성 (Severity 분류)
    - Behavioral Economics Score 분석
    - 패턴 분석 (Developer vs General)
  Day 5:
    - Verbatim Quotes 선별
    - Persona-Specific Insights 정리

Week 4: Reporting & Iteration
  Day 1-2:
    - Final Report 작성
    - Recommendations 우선순위화
  Day 3:
    - 팀 발표 (Findings + Recommendations)
  Day 4-5:
    - 와이어프레임 수정 반영
    - 개발 착수 Go/No-Go 결정
```

---

## 9. Risk Mitigation

```yaml
Risk 1: No-Show (참가자 불참)
  확률: 20%
  대응:
    - 2명 대기자 확보 (각 세그먼트)
    - 48시간 전 + 24시간 전 리마인더
    - No-show 시 대기자 즉시 투입

Risk 2: Prototype Bug (프로토타입 오류)
  확률: 30%
  대응:
    - 사전 파일럿 테스트 (내부 1회)
    - 모든 태스크 경로 사전 테스트
    - 백업 정적 스크린샷 준비
    - 오류 시 "이 부분은 아직 개발 중입니다" 안내

Risk 3: Facilitator Bias (진행자 편향)
  확률: Medium
  대응:
    - 스크립트 엄격 준수
    - 유도 질문 금지 (개방형만)
    - 별도 Observer가 편향 체크
    - 세션 녹화로 사후 검증

Risk 4: Small Sample Size (표본 부족)
  확률: Inherent (N=10)
  대응:
    - 정량 데이터는 참고용 (통계적 유의성 X)
    - 정성 데이터 중심 분석
    - 동일 이슈 2명+ 발견 시 유의미 판단
    - 필요시 2차 테스트 (추가 5명) 계획

Risk 5: Recruitment Difficulty (모집 어려움)
  확률: 25% (특히 Developer)
  대응:
    - 다채널 동시 모집
    - 인센티브 상향 가능 ($50 → $75)
    - 내부 네트워크 활용 (AI 커뮤니티 지인)
    - 기한 연장 (최대 +3일)
```

---

## 10. Appendix

### A. Testing Tools Comparison

| Tool | Purpose | Cost | Selected |
|------|---------|------|----------|
| Maze | Prototype testing + analytics | $99/mo | ✅ |
| Hotjar | Heatmaps + recordings | Free tier | ✅ |
| UserTesting.com | Participant recruitment | $49/participant | ✅ (General) |
| Respondent.io | Participant recruitment | $5/screener | ✅ (Backup) |
| Zoom | Remote sessions | Free tier | ✅ |
| Notion | Notes + analysis | Free tier | ✅ |
| Google Forms | Screening + surveys | Free | ✅ |

### B. Budget Estimate

```yaml
Participant Incentives:
  Developer: 5 × $50 = $250
  General: 5 × $30 = $150
  Subtotal: $400

Tools:
  Maze: $99/month × 1 = $99
  UserTesting.com: $49 × 5 = $245
  Respondent.io: $5 × 35 = $175
  Subtotal: $519

Total Budget: ~$920
Contingency (15%): $138
Grand Total: ~$1,060
```

### C. References

```yaml
Methodology:
  - Nielsen, J. (2000). Why You Only Need to Test with 5 Users
  - Brooke, J. (1996). SUS: A Quick and Dirty Usability Scale
  - Reichheld, F. (2003). The One Number You Need to Grow (NPS)

Behavioral Economics:
  - Kahneman & Tversky (1979). Prospect Theory (Loss Aversion)
  - Cialdini, R. (2001). Influence: The Psychology of Persuasion
  - Kivetz et al. (2006). The Goal Gradient Hypothesis (Progress Effect)

Factagora Internal:
  - USER_JOURNEY_MAP.md (Part 2: Personas, Part 5: BE Principles)
  - MOTIVATION_DESIGN.md (행동 경제학 5원칙)
  - COMPETITIVE_ANALYSIS.md (경쟁사 UX 분석)
  - GROWTH_FUNNEL.md (AARRR Funnel Metrics)
```

---

**End of Document**
