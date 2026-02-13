# Claim & Prediction 분리 구현 계획서

## 📋 Executive Summary

**목표**: Agenda를 Claim(팩트체크)과 Prediction(예측)으로 분리하여 Kalshi 스타일 2열 레이아웃으로 구현

**핵심 기능**:
- ✅ 별도 테이블로 완전 분리
- ✅ Premium/Free 권한 차별화
- ✅ Reddit 스타일 승인 시스템
- ✅ 생성자에 의한 Resolution
- ✅ Kalshi 스타일 2열 레이아웃
- ✅ 신뢰도 계산 시스템

---

## 🎯 Phase별 구현 계획

### Phase 1: 데이터베이스 & 권한 시스템 (3-4일)

**1.1 사용자 권한 테이블 업데이트**
```sql
-- migrations/20260211_user_tiers.sql
ALTER TABLE users ADD COLUMN tier VARCHAR(20) DEFAULT 'FREE';
ALTER TABLE users ADD COLUMN agenda_creation_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN agenda_creation_reset_at TIMESTAMPTZ DEFAULT NOW();

-- 함수: 월별 생성 제한 체크
CREATE FUNCTION check_agenda_creation_limit(p_user_id UUID, p_user_tier VARCHAR) ...
```

**1.2 Claims 테이블 생성**
```sql
-- migrations/20260211_claims_table.sql
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50),

  claim_date TIMESTAMPTZ,
  claim_type VARCHAR(20),
  source_url TEXT,

  approval_status VARCHAR(20) DEFAULT 'PENDING',
  verification_status VARCHAR(20) DEFAULT 'PENDING',

  resolution_date TIMESTAMPTZ,
  resolution_value BOOLEAN,
  resolved_by UUID,

  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**1.3 관련 테이블**
- claim_evidence
- claim_votes
- claim_arguments
- claim_argument_replies

**작업 항목**:
- [ ] 마이그레이션 파일 작성
- [ ] TypeScript 타입 정의 (`src/types/claim.ts`)
- [ ] Supabase 스키마 적용
- [ ] 테스트 데이터 시드

---

### Phase 2: Claims API 구현 (2-3일)

**2.1 Core APIs**
```typescript
// app/api/claims/route.ts
GET    /api/claims              // 목록 (필터, 정렬)
POST   /api/claims              // 생성 (권한 체크)

// app/api/claims/[id]/route.ts
GET    /api/claims/:id          // 상세
PATCH  /api/claims/:id          // 수정
DELETE /api/claims/:id          // 삭제

// app/api/claims/[id]/resolve/route.ts
POST   /api/claims/:id/resolve  // Resolution (생성자만)

// app/api/claims/[id]/vote/route.ts
GET    /api/claims/:id/vote     // 사용자 투표 조회
POST   /api/claims/:id/vote     // TRUE/FALSE 투표

// app/api/claims/[id]/evidence/route.ts
GET    /api/claims/:id/evidence // 증거 목록
POST   /api/claims/:id/evidence // 증거 제출

// app/api/claims/[id]/arguments/route.ts
GET    /api/claims/:id/arguments // 논증 목록
POST   /api/claims/:id/arguments // 논증 제출
```

**2.2 Admin APIs**
```typescript
// app/api/admin/claims/[id]/approve/route.ts
POST   /api/admin/claims/:id/approve  // 승인/거부
```

**작업 항목**:
- [ ] API 라우트 파일 생성
- [ ] 권한 미들웨어 구현
- [ ] Validation 로직
- [ ] API 테스트

---

### Phase 3: Claims UI 컴포넌트 (3-4일)

**3.1 Card 컴포넌트**
```typescript
// src/components/claim/ClaimCard.tsx
- Kalshi 스타일 카드
- TRUE/FALSE 퍼센트 바
- 증거 수, 검증자 수 표시
- 신뢰도 배지
```

**3.2 Grid 컴포넌트**
```typescript
// src/components/claim/ClaimsGrid.tsx
- 필터 (카테고리, 상태)
- 정렬 (최신, 인기, 신뢰도)
- 페이지네이션
```

**3.3 상세 페이지**
```typescript
// app/claims/[id]/page.tsx
- Claim 정보
- TRUE/FALSE 투표 UI
- 증거 목록
- 논증 & 답글 (기존 debate 컴포넌트 재활용)
- Resolution UI (생성자만 표시)
```

**3.4 생성 폼**
```typescript
// src/components/claim/ClaimForm.tsx
- 제목, 설명, 카테고리
- 주장 날짜 (claim_date)
- 출처 URL
- Resolution 날짜
- Premium 상태 표시
```

**작업 항목**:
- [ ] ClaimCard 컴포넌트
- [ ] ClaimsGrid 컴포넌트
- [ ] /claims 페이지
- [ ] /claims/:id 상세 페이지
- [ ] ClaimForm 컴포넌트
- [ ] 증거 제출 UI
- [ ] Resolution UI

---

### Phase 4: 홈페이지 2열 레이아웃 (1-2일)

**4.1 레이아웃 구조**
```tsx
// app/page.tsx
<div className="grid lg:grid-cols-2 gap-6">
  {/* 왼쪽: Claims */}
  <div>
    <h3>📄 Claims (Fact-Checking)</h3>
    {claims.map(claim => <ClaimCard />)}
  </div>

  {/* 오른쪽: Predictions */}
  <div>
    <h3>🎯 Predictions (Forecasting)</h3>
    {predictions.map(pred => <PredictionCard />)}
  </div>
</div>
```

**4.2 데이터 페칭**
```typescript
// 홈페이지에서 Claims와 Predictions 동시 페칭
const [claims, setClaims] = useState([])
const [predictions, setPredictions] = useState([])

useEffect(() => {
  Promise.all([
    fetch('/api/claims?limit=5'),
    fetch('/api/predictions?limit=5')
  ]).then(...)
})
```

**작업 항목**:
- [ ] 홈페이지 레이아웃 변경
- [ ] 반응형 디자인 (모바일은 세로 배치)
- [ ] 로딩 스켈레톤
- [ ] 에러 핸들링

---

### Phase 5: 권한 & 승인 시스템 (2-3일)

**5.1 권한 체크 미들웨어**
```typescript
// lib/auth/permissions.ts
export async function checkAgendaCreationPermission(userId: string) {
  const user = await getUser(userId)

  if (user.tier === 'PREMIUM' || user.tier === 'ADMIN') {
    return { allowed: true, requiresApproval: false }
  }

  // FREE 유저: 월 3개 제한 + 승인 필요
  const canCreate = await checkMonthlyLimit(userId)
  return {
    allowed: canCreate,
    requiresApproval: true,
    remaining: 3 - user.agenda_creation_count
  }
}
```

**5.2 승인 대시보드 (Admin)**
```typescript
// app/admin/approvals/page.tsx
- 승인 대기 목록
- 승인/거부 버튼
- 거부 이유 입력
```

**5.3 알림 시스템**
```typescript
// 승인/거부시 생성자에게 알림
- 이메일 알림 (향후)
- 인앱 알림 (향후)
- 현재: 상태 표시만
```

**작업 항목**:
- [ ] 권한 체크 함수
- [ ] 월별 제한 로직
- [ ] Admin 승인 페이지
- [ ] 승인 상태 UI
- [ ] 알림 시스템 (기본)

---

### Phase 6: Resolution 시스템 (2-3일)

**6.1 Resolution API**
```typescript
// app/api/claims/[id]/resolve/route.ts
POST /api/claims/:id/resolve
{
  resolution_value: true | false,
  reasoning: "..."
}

// 체크:
// 1. 생성자 권한
// 2. resolution_date 도달 여부
// 3. 이미 해결되지 않았는지
```

**6.2 포인트 정산**
```typescript
// lib/points/calculate.ts
- 투표자 포인트 지급/차감
- 증거 제출자 포인트
- 논증 작성자 포인트
- 생성자 보상
```

**6.3 Resolution UI**
```typescript
// src/components/claim/ResolutionPanel.tsx
- 생성자만 보이는 패널
- Resolution 날짜 도달 여부 표시
- TRUE/FALSE 선택 버튼
- 확인 다이얼로그
```

**작업 항목**:
- [ ] Resolution API
- [ ] 포인트 계산 로직
- [ ] Resolution UI
- [ ] 결과 페이지
- [ ] 알림 발송

---

### Phase 7: 신뢰도 계산 (2-3일)

**7.1 신뢰도 계산 함수**
```typescript
// lib/credibility/calculate.ts
- calculateClaimCredibility()
- calculateEvidenceScore()
- calculateConsensusScore()
- calculateSourceScore()
```

**7.2 실시간 업데이트**
```typescript
// 증거/투표 추가시 신뢰도 재계산
- 트리거로 자동 업데이트
- 또는 배치 작업으로 주기적 업데이트
```

**7.3 신뢰도 배지**
```typescript
// src/components/claim/CredibilityBadge.tsx
- 점수별 색상 & 아이콘
- 툴팁으로 상세 정보
```

**작업 항목**:
- [ ] 신뢰도 계산 함수
- [ ] DB 트리거 또는 배치 작업
- [ ] 신뢰도 배지 컴포넌트
- [ ] 상세 정보 툴팁

---

### Phase 8: 테스트 & 최적화 (2-3일)

**8.1 E2E 테스트**
```typescript
// tests/claims/
- claim-creation.spec.ts
- claim-voting.spec.ts
- claim-evidence.spec.ts
- claim-resolution.spec.ts
- approval-workflow.spec.ts
```

**8.2 성능 최적화**
- 쿼리 최적화
- 인덱스 추가
- 캐싱 전략
- 이미지 최적화

**8.3 버그 수정**
- 권한 관련 엣지 케이스
- UI/UX 개선
- 모바일 최적화

**작업 항목**:
- [ ] Playwright E2E 테스트
- [ ] API 통합 테스트
- [ ] 성능 프로파일링
- [ ] 버그 수정
- [ ] 문서화

---

## 📊 Timeline 요약

| Phase | 작업 | 예상 기간 | 우선순위 |
|-------|------|----------|---------|
| Phase 1 | DB & 권한 시스템 | 3-4일 | 🔴 Critical |
| Phase 2 | Claims API | 2-3일 | 🔴 Critical |
| Phase 3 | Claims UI | 3-4일 | 🔴 Critical |
| Phase 4 | 2열 레이아웃 | 1-2일 | 🟡 High |
| Phase 5 | 권한 & 승인 | 2-3일 | 🟡 High |
| Phase 6 | Resolution | 2-3일 | 🟡 High |
| Phase 7 | 신뢰도 계산 | 2-3일 | 🟢 Medium |
| Phase 8 | 테스트 & 최적화 | 2-3일 | 🟢 Medium |

**총 예상 기간**: 18-25일 (약 3-4주)

---

## 🎨 UI/UX 스타일 가이드

### Claims 카드 (Kalshi 스타일)

```
┌───────────────────────────────────────┐
│ 📄 economics         ⏳ 검증 중        │
│                                       │
│ Tesla achieved $30B revenue in Q4     │
│ 2024                                  │
│                                       │
│ ✅ TRUE    75% ████████░░              │
│ ❌ FALSE   25% ███░░░░░░░              │
│                                       │
│ 🔍 12 sources  👥 45 verifiers         │
│ 🏆 신뢰도: 0.85 (Credible)             │
└───────────────────────────────────────┘
```

### 색상 팔레트

- **TRUE**: Green (#10B981)
- **FALSE**: Red (#EF4444)
- **PENDING**: Gray (#6B7280)
- **HIGH CREDIBILITY**: Dark Green (#065F46)
- **LOW CREDIBILITY**: Dark Red (#7F1D1D)

### 아이콘

- Claims: 📄
- Predictions: 🎯
- Evidence: 🔍
- Verifiers: 👥
- Credibility: 🏆
- Resolution: ⚖️

---

## 🔐 보안 고려사항

1. **권한 체크**: 모든 API에서 서버사이드 권한 검증
2. **Rate Limiting**: Agenda 생성 남용 방지
3. **Input Validation**: XSS, SQL Injection 방지
4. **CSRF Protection**: 폼 제출시 CSRF 토큰
5. **SQL Injection**: Parameterized queries 사용

---

## 📈 성공 지표 (KPI)

1. **Claim 생성 수**: 월 100개 이상
2. **참여율**: Claim당 평균 20명 이상 참여
3. **증거 제출**: Claim당 평균 5개 이상
4. **승인률**: FREE 유저 Claim 승인률 60% 이상
5. **Resolution 정확도**: 90% 이상

---

## 🚀 배포 계획

### 1. Staging 배포
- Phase 1-3 완료 후 Staging 환경 배포
- 내부 테스트 (1주일)

### 2. Beta 출시
- Phase 4-6 완료 후 제한된 사용자에게 Beta 공개
- 피드백 수집 (2주일)

### 3. Production 배포
- Phase 7-8 완료 후 전체 공개
- 모니터링 & 핫픽스

---

## 📚 참고 자료

- [Kalshi.com](https://kalshi.com) - UI/UX 참고
- [Reddit](https://reddit.com) - 승인 시스템 참고
- [PolitiFact](https://www.politifact.com) - 신뢰도 배지 참고
- [Metaculus](https://www.metaculus.com) - 예측 시장 참고

---

## ✅ 다음 단계

**즉시 시작 가능:**
1. Phase 1 마이그레이션 파일 작성
2. TypeScript 타입 정의
3. Claims API 구현 시작

**질문 & 결정 필요:**
1. ✅ Premium 가격 정책?
2. ✅ 월 3개 제한 충분한가?
3. ✅ 승인 기준 더 명확히?
4. ✅ 신뢰도 계산 가중치 조정?

---

**준비 완료! 개발 시작하시겠습니까?** 🚀
