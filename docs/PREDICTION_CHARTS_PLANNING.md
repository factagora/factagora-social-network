# Prediction Charts 기획 정리

## 현재 상황

### 1. PredictionChart (기존 - YES/NO 트렌드)
**용도**: Binary 예측의 투표 트렌드
**데이터**: 실제 사용자/AI 투표 데이터를 시간별로 집계
**시각화**:
- 단순한 라인 차트
- YES 확률을 파란색 선으로 표시
- Y축: 0-100% 확률
- 깔끔하고 심플한 스타일

**API**: `/api/predictions/[id]/timeseries`
**사용 조건**: `predictionType !== "TIMESERIES"`

### 2. TimeseriesForecastChart (새로운 - 가격 예측)
**용도**: 시계열 예측 (예: Bitcoin 가격)
**데이터**: AI 모델의 미래 가격 예측값
**시각화**:
- ComposedChart (복합 차트)
- 예측선 + 80% 신뢰구간 + 극단 시나리오
- Area fill로 불확실성 표현
- 더 복잡하고 전문적인 스타일

**API**: `/api/predictions/[id]/forecast`
**사용 조건**: `predictionType === "TIMESERIES"`

---

## 문제점

### 1. 스타일 불일치
- TimeseriesForecastChart가 너무 복잡하고 화려함
- PredictionChart의 심플한 스타일이 전체 디자인과 더 잘 어울림
- 색상 팔레트가 다름 (blue-600 vs 다양한 blue 톤)

### 2. 시간 구분 미흡
- TimeseriesForecastChart가 전부 미래 예측만 보여줌
- 현재 시간 기준으로 과거 실제 데이터 vs 미래 예측을 구분해야 함
- 사용자가 "지금까지 얼마나 정확했는지" 판단할 수 없음

### 3. 데이터 연속성 부족
- 실제 데이터에서 예측으로 자연스럽게 이어지지 않음
- 현재 시점의 표시가 명확하지 않음

---

## 개선 방안

### Option A: TimeseriesForecastChart 스타일 통일 (권장)
**변경 사항**:
1. **색상 통일**
   - 실제 데이터: `#3b82f6` (blue-500) - 진한 실선
   - 예측 데이터: `#3b82f6` (blue-500) - 점선 (dashed)
   - 신뢰구간: 연한 파란색 음영 (기존 유지)

2. **현재 시간 구분선 추가**
   - 수직 점선으로 "NOW" 표시
   - 좌측: 실제 데이터 (Historical Data)
   - 우측: 예측 데이터 (Forecast)

3. **스타일 심플화**
   - 극단 시나리오 영역 제거 (너무 복잡)
   - 80% 신뢰구간만 유지
   - 툴팁 스타일을 PredictionChart와 통일
   - 배경색을 slate-800으로 변경

4. **범례 정리**
   - "Historical Data" / "Forecast" / "80% Confidence"
   - 간결한 아이콘 사용

**구현 예시**:
```typescript
// 데이터 구조
{
  date: "2025-01-15",
  value: 95000,        // 실제 데이터 or 예측값
  isActual: true,      // true = 실제, false = 예측
  confidenceLower: null,  // 실제 데이터는 null
  confidenceUpper: null,
}

// 현재 시간 기준으로 분리
const now = new Date()
const historicalData = data.filter(d => new Date(d.date) <= now)
const forecastData = data.filter(d => new Date(d.date) > now)
```

**장점**:
- 실제 데이터와 예측의 명확한 구분
- 과거 정확도를 확인 가능
- 스타일 일관성 확보
- 사용자 신뢰도 향상

### Option B: PredictionChart 확장
**변경 사항**:
1. PredictionChart를 확장해서 TIMESERIES도 지원
2. 가격 데이터를 YES 확률처럼 표현 (정규화)
3. 동일한 심플한 스타일 유지

**단점**:
- 신뢰구간을 표현하기 어려움
- 가격 예측의 불확실성을 전달하기 힘듦

### Option C: 별도 컴포넌트 유지 + 디자인 시스템 적용
**변경 사항**:
1. 공통 디자인 토큰 생성 (색상, 폰트, 간격)
2. 두 차트 모두 동일한 토큰 사용
3. 각각의 특성은 유지하면서 일관성 확보

---

## 권장 구현 계획

### Phase 1: TimeseriesForecastChart 개선 (우선순위 높음)
1. ✅ 현재 시간 기준으로 데이터 분리
2. ✅ 실제 데이터 (실선) vs 예측 (점선) 시각화
3. ✅ "NOW" 구분선 추가
4. ✅ 색상 및 스타일 통일 (slate-800 배경, blue-500 라인)
5. ✅ 극단 시나리오 제거 (80% 신뢰구간만 유지)

### Phase 2: API 데이터 구조 개선
1. ✅ `/api/predictions/[id]/forecast`에서 실제 데이터도 함께 반환
2. ✅ `isActual` 플래그 추가
3. ✅ 현재 가격 포함

### Phase 3: 공통 디자인 시스템
1. 차트 공통 스타일 파일 생성
2. 색상, 폰트, 툴팁 스타일 통일
3. 두 컴포넌트 모두 적용

---

## 데이터 흐름

### 현재
```
TIMESERIES Prediction
  → /api/predictions/[id]/forecast
  → TimeseriesForecastChart
  → 미래 예측만 표시
```

### 개선 후
```
TIMESERIES Prediction
  → /api/predictions/[id]/forecast
    - historical: 실제 데이터 (과거~현재)
    - forecast: 예측 데이터 (현재~미래)
    - currentPrice: 현재 가격
  → TimeseriesForecastChart
    - 좌측: 실제 데이터 (실선)
    - 중앙: NOW 구분선
    - 우측: 예측 데이터 (점선 + 신뢰구간)
```

---

## 다음 단계

### 즉시 구현
1. TimeseriesForecastChart 스타일 수정
   - 색상 통일 (#3b82f6)
   - 배경 slate-800
   - 극단 시나리오 제거

2. 현재 시간 구분 추가
   - NOW 수직선
   - 실선/점선 구분

3. API 응답에 실제 데이터 추가
   - Bitcoin 과거 가격 데이터 포함
   - isActual 플래그

### 추후 고려
1. 예측 정확도 평가 섹션
2. 실제 vs 예측 오차 시각화
3. 다른 예측과 비교 기능

---

## 기대 효과

1. **사용자 신뢰도 향상**
   - 과거 예측의 정확도를 확인 가능
   - 투명성 증가

2. **일관된 사용자 경험**
   - 모든 차트가 비슷한 스타일
   - 학습 곡선 감소

3. **정보 전달력 향상**
   - 실제 vs 예측 명확히 구분
   - 불확실성을 적절히 표현
