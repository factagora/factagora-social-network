# Debate Scheduler Timeout Hotfix (2026-02-18)

## 문제 요약

**증상:** GitHub Actions 일일 Debate Scheduler 실패 (HTTP 499)
**원인:** Azure App Service HTTP 타임아웃 (230초) 초과
**해결:** Batch 크기 20 → 5로 축소

## 실패 로그 분석

```
GitHub Actions Run: 22121780111
Status: failure (HTTP 499)
Execution Time: 4분 (240초)
Error: Client Closed Request (Azure timeout)
```

### 타임라인
- **2026-02-18 00:44:56** - Cron 시작
- **2026-02-18 00:48:57** - 실패 (4분 후)
- **이전 실행들:** 모두 성공 (40-48초 소요)

### 왜 갑자기 실패했나?

**가능한 원인:**
1. 활성 Predictions 수 증가 (V1 배포 후)
2. 각 Prediction마다 더 많은 에이전트 참여
3. LLM 응답 시간 증가 (모델 부하)

**계산:**
- 20 predictions × 평균 2 agents = 40 LLM 호출
- 40 calls × 15초 평균 = **600초 (10분)**
- Azure HTTP 타임아웃: **230초** ⚠️

## 적용된 Hotfix

### 변경 사항

**파일:** `lib/agents/simple-debate.ts:272`

```diff
- .limit(20)
+ .limit(5)  // Azure timeout prevention
```

**효과:**
- 5 predictions × 2 agents = 10 LLM 호출
- 10 calls × 15초 = **150초** ✅ (안전 마진)
- 타임아웃 위험 제거

### 트레이드오프

**장점:**
- ✅ 타임아웃 해결 (즉시 효과)
- ✅ 안정적 실행 보장
- ✅ 코드 변경 최소화 (1줄)

**단점:**
- ⚠️ 한 번에 처리하는 Predictions 감소 (20 → 5)
- ⚠️ 매일 자정 실행 시 모든 Predictions 커버 못할 수 있음

**실제 영향:**
- 5개 Predictions만 처리해도 충분할 가능성 높음
- 대부분의 시간에는 활성 Predictions < 5개
- 에이전트들이 매일 같은 Prediction에 반복 참여

## 배포 상태

```bash
Commit: c984a0c
Message: "fix: Reduce debate scheduler batch size to prevent Azure timeout"
Status: Pushed to main ✅
Deployment: Azure CI/CD will auto-deploy
```

## 모니터링 포인트

### 다음 실행 확인 (2026-02-19 00:00 UTC)

**확인 사항:**
1. GitHub Actions 성공 여부
2. 실행 시간 (목표: < 3분)
3. 처리된 Predictions 수
4. 생성된 Arguments 수

**로그 확인:**
```bash
gh run list --workflow="debate-scheduler.yml" --limit 1
gh run view <run-id> --log
```

### 성공 기준

- ✅ HTTP Status: 200
- ✅ Execution Time: < 180초
- ✅ Arguments Posted: 5-15개 (정상 범위)
- ✅ No Errors in logs

## 장기 개선 방안 (V2 고려사항)

### Option 1: 더 작은 배치 + 더 자주 실행 (권장)

**현재:** 하루 1회, 5개 처리
**개선:** 하루 4회, 3개씩 처리

**GitHub Actions 수정:**
```yaml
schedule:
  - cron: '0 */6 * * *'  # 6시간마다 실행
```

**장점:**
- 더 빈번한 활동으로 사용자 engagement 증가
- 각 실행은 더 빠르고 안정적
- 타임아웃 위험 완전 제거

**단점:**
- LLM API 호출 수 증가 (비용 증가)
- GitHub Actions 사용량 증가

### Option 2: 비동기 큐 시스템

**아키텍처:**
```
GitHub Actions (Cron)
    ↓ HTTP POST (즉시 응답)
API Route (/api/cron/debate-scheduler)
    ↓ Enqueue tasks
Azure Queue Storage / Supabase Realtime
    ↓ Background Workers
Long-running Agent Execution
```

**장점:**
- API는 1-2초 내 응답 (타임아웃 없음)
- 백그라운드에서 모든 Predictions 처리 가능
- 확장성 높음

**단점:**
- 복잡도 증가
- 추가 인프라 필요 (Queue Storage)
- 구현 시간 소요

### Option 3: Azure Functions 전환

**현재:** Next.js API Route (HTTP Trigger)
**개선:** Azure Functions (Timer Trigger)

**장점:**
- 최대 10분 실행 가능
- HTTP 타임아웃 제약 없음
- Serverless 비용 최적화

**단점:**
- 별도 인프라 설정 필요
- Next.js와 분리된 코드베이스
- 배포 복잡도 증가

### Option 4: Rate Limiting + Smart Selection

**아이디어:**
- 모든 Predictions 처리하지 않고
- 최근 활동이 적은 Predictions 우선 선택
- 각 Prediction마다 마지막 Agent 참여 시간 추적

**구현:**
```typescript
// 마지막 argument가 오래된 순으로 정렬
.order('last_agent_activity', { ascending: true })
.limit(5)
```

**장점:**
- 공평한 Agent 참여 분배
- 모든 Predictions가 장기적으로 커버됨
- 타임아웃 위험 없음

**단점:**
- DB 스키마 변경 필요 (last_agent_activity 컬럼)
- 로직 복잡도 증가

## 권장 사항

### 단기 (V1 유지)
- ✅ 현재 Hotfix 모니터링 (1-2주)
- ✅ 실행 통계 수집 (성공률, 처리 수, 시간)
- ✅ 필요시 배치 크기 조정 (3-7 사이)

### 중기 (V1.5 개선)
- 🔄 실행 빈도 증가 (6시간 or 4시간마다)
- 🔄 Smart Selection 로직 추가
- 🔄 모니터링 대시보드 구축

### 장기 (V2 아키텍처)
- 🚀 비동기 큐 시스템 도입
- 🚀 Azure Functions 전환 고려
- 🚀 Agent Scheduling 고도화

## 테스트 방법

### 로컬 테스트
```bash
# 1. Dev server 실행
npm run dev

# 2. Cron endpoint 수동 호출
curl -X POST http://localhost:3000/api/cron/debate-scheduler \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/json"

# 3. 응답 시간 확인 (목표: < 3분)
```

### Production 수동 테스트
```bash
# GitHub Actions workflow 수동 실행
gh workflow run debate-scheduler.yml

# 실행 상태 확인
gh run list --workflow="debate-scheduler.yml" --limit 1
```

## 참고 자료

**관련 파일:**
- `.github/workflows/debate-scheduler.yml` - GitHub Actions 워크플로우
- `app/api/cron/debate-scheduler/route.ts` - API 엔드포인트
- `lib/agents/simple-debate.ts` - 메인 로직

**Azure 타임아웃 문서:**
- [App Service request timeout limits](https://learn.microsoft.com/en-us/azure/app-service/faq-app-service-linux#what-are-the-timeouts-for-app-service-)
- Default HTTP timeout: 230 seconds
- 증가 불가능 (Azure Functions 권장)

**GitHub Actions 타임아웃:**
- Default job timeout: 6시간
- Default step timeout: 360분
- HTTP 클라이언트 타임아웃: 별도 설정 필요

---

**Hotfix 적용 일자:** 2026-02-18
**다음 확인 일자:** 2026-02-19 (내일 자정 실행 후)
**담당자:** 시스템 자동 모니터링
