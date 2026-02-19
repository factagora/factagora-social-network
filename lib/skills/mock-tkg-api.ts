// ============================================================================
// Mock TKG API Implementation
// Simulates TKG ML Engine responses until real API is ready
// ============================================================================

import type {
  TimeseriesForecastingInput,
  TimeseriesForecastingOutput,
  StatisticalValidationInput,
  StatisticalValidationOutput,
} from '@/src/types/skill';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate linear regression for simple trend prediction
 */
function linearRegression(data: Array<{ x: number; y: number }>): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = data.length;
  if (n === 0) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumX2 += point.x * point.x;
    sumY2 += point.y * point.y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² score
  const yMean = sumY / n;
  let ssTotal = 0;
  let ssResidual = 0;

  for (const point of data) {
    const predicted = slope * point.x + intercept;
    ssTotal += Math.pow(point.y - yMean, 2);
    ssResidual += Math.pow(point.y - predicted, 2);
  }

  const r2 = ssTotal !== 0 ? 1 - ssResidual / ssTotal : 0;

  return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) };
}

/**
 * Calculate moving average
 */
function movingAverage(values: number[], window: number = 3): number {
  if (values.length === 0) return 0;
  if (values.length < window) window = values.length;

  const recent = values.slice(-window);
  return recent.reduce((sum, val) => sum + val, 0) / recent.length;
}

/**
 * Calculate standard deviation
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Detect trend direction
 */
function detectTrend(values: number[]): 'INCREASING' | 'DECREASING' | 'STABLE' {
  if (values.length < 2) return 'STABLE';

  // Simple comparison: first half vs second half
  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const difference = secondAvg - firstAvg;
  const threshold = 0.05; // 5% threshold

  if (difference > threshold) return 'INCREASING';
  if (difference < -threshold) return 'DECREASING';
  return 'STABLE';
}

// ============================================================================
// Mock Timeseries Forecasting
// ============================================================================

/**
 * Generate timeseries forecast for numeric data
 * Used for predictions like Bitcoin price, stock prices, etc.
 */
function mockTimeseriesForecast(
  historicalData: Array<{ date: string; value: number }>,
  forecastHorizon: number
): TimeseriesForecastingOutput {
  const values = historicalData.map(d => d.value);
  const dataPoints = values.length;

  // Prepare data for regression
  const regressionData = values.map((value, index) => ({
    x: index,
    y: value,
  }));

  // Perform linear regression
  const { slope, intercept, r2 } = linearRegression(regressionData);

  // Generate forecast points
  const forecastPoints: Array<{ date: string; value: number; confidenceInterval: { lower: number; upper: number } }> = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  const stdDev = standardDeviation(values);

  for (let i = 1; i <= forecastHorizon; i++) {
    const nextX = dataPoints + i - 1;
    const predictedValue = slope * nextX + intercept;

    // Confidence interval widens as we forecast further out
    const uncertainty = stdDev * Math.sqrt(1 + i / dataPoints) * 1.96;
    const confidenceInterval = {
      lower: Math.max(0, predictedValue - uncertainty),
      upper: predictedValue + uncertainty,
    };

    // Next date (assuming daily data)
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);

    forecastPoints.push({
      date: forecastDate.toISOString().split('T')[0],
      value: predictedValue,
      confidenceInterval,
    });
  }

  // Calculate trend
  const trend = detectTrend(values);

  // Calculate confidence
  let confidence = r2 * 0.7;
  confidence += Math.min(dataPoints / 20, 1) * 0.3;
  confidence = Math.max(0.3, Math.min(0.95, confidence));

  // Generate evidence
  const evidence: string[] = [];
  const recentChange = values[values.length - 1] - values[0];
  const percentChange = (recentChange / values[0]) * 100;

  if (Math.abs(percentChange) > 5) {
    evidence.push(
      `Historical data shows ${percentChange > 0 ? 'increase' : 'decrease'} of ${Math.abs(percentChange).toFixed(1)}% over ${dataPoints} periods`
    );
  }

  evidence.push(`Based on ${dataPoints} data points with R² = ${r2.toFixed(3)}`);

  if (trend !== 'STABLE') {
    evidence.push(`Current trend: ${trend}`);
  }

  if (r2 > 0.7) {
    evidence.push(`Linear model fits well (high R²)`);
  } else if (r2 < 0.3) {
    evidence.push(`Low model fit - prediction uncertainty is high`);
  }

  // Calculate statistical validation
  const meanValue = values.reduce((sum, val) => sum + val, 0) / values.length;
  const tStatistic = Math.abs((values[values.length - 1] - meanValue) / (stdDev / Math.sqrt(dataPoints)));
  const pValue = tStatistic > 1.96 ? 0.05 : 0.1; // Simplified p-value

  return {
    prediction: forecastPoints[forecastPoints.length - 1].value, // Last forecast point
    confidence,
    trend,
    supportingEvidence: evidence,
    technicalDetails: {
      method: 'Linear Regression',
      dataPoints,
      r2Score: r2,
      forecastInterval: {
        lower: forecastPoints[0].confidenceInterval.lower,
        upper: forecastPoints[0].confidenceInterval.upper,
      },
    },
    // Extended data for timeseries
    forecast: forecastPoints,
    statistical_validation: {
      method: 't-test',
      statistic: tStatistic,
      p_value: pValue,
      significant: pValue < 0.05,
      confidence_level: 0.95,
    },
  };
}

/**
 * Mock implementation of TKG Timeseries Forecasting API
 *
 * Uses simple linear regression and moving average for demonstration
 * Real TKG API would use ARIMA, Prophet, LSTM, etc.
 */
export async function mockTimeseriesForecasting(
  input: TimeseriesForecastingInput
): Promise<TimeseriesForecastingOutput> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));

  const { historicalData, forecastHorizon = 30 } = input;

  if (!historicalData || historicalData.length === 0) {
    throw new Error('No historical data provided');
  }

  // Detect data type: TIMESERIES (has 'value') vs BINARY (has 'yesPercentage')
  const isTimeseriesData = 'value' in historicalData[0];

  if (isTimeseriesData) {
    // Handle TIMESERIES data (e.g., Bitcoin price, stock prices, etc.)
    return mockTimeseriesForecast(historicalData as any[], forecastHorizon);
  }

  // Handle BINARY prediction data (legacy format)
  const yesPercentages = historicalData.map((d: any) => d.yesPercentage);
  const dataPoints = historicalData.length;

  // Prepare data for regression (x = time index, y = yes percentage)
  const regressionData = historicalData.map((d, index) => ({
    x: index,
    y: d.yesPercentage,
  }));

  // Perform linear regression
  const { slope, intercept, r2 } = linearRegression(regressionData);

  // Predict next value
  const nextX = dataPoints;
  let prediction = slope * nextX + intercept;
  prediction = Math.max(0, Math.min(100, prediction)) / 100; // Clamp to 0-1

  // Calculate trend
  const trend = detectTrend(yesPercentages);

  // Calculate confidence based on R² and data points
  let confidence = r2 * 0.7; // R² contributes 70%

  // More data = higher confidence (up to 30%)
  const dataPointsFactor = Math.min(dataPoints / 20, 1) * 0.3;
  confidence += dataPointsFactor;

  // Low volatility = higher confidence
  const volatility = standardDeviation(yesPercentages) / 100;
  confidence -= volatility * 0.2;

  confidence = Math.max(0.3, Math.min(0.95, confidence));

  // Generate supporting evidence
  const evidence: string[] = [];

  // Trend evidence
  const recentChange = yesPercentages[yesPercentages.length - 1] - yesPercentages[0];
  if (Math.abs(recentChange) > 5) {
    evidence.push(
      `과거 ${dataPoints}개 데이터 포인트에서 ${recentChange > 0 ? 'YES' : 'NO'} 투표가 ${Math.abs(recentChange).toFixed(1)}% ${recentChange > 0 ? '증가' : '감소'}했습니다`
    );
  }

  // Volume evidence
  const totalVotes = historicalData.reduce((sum, d) => sum + d.totalVotes, 0);
  const avgVotes = totalVotes / dataPoints;
  evidence.push(`평균 ${avgVotes.toFixed(0)}개의 투표가 참여했습니다`);

  // Recent momentum
  const recent3 = yesPercentages.slice(-3);
  const recentTrend = detectTrend(recent3);
  if (recentTrend !== 'STABLE') {
    evidence.push(`최근 추세: ${recentTrend === 'INCREASING' ? '상승세' : '하락세'}`);
  }

  // Data quality
  if (dataPoints >= 10) {
    evidence.push(`충분한 데이터 포인트 (${dataPoints}개)로 신뢰도 높은 예측`);
  } else if (dataPoints < 5) {
    evidence.push(`데이터 포인트가 부족하여 (${dataPoints}개) 예측 불확실성이 높습니다`);
  }

  // Model quality
  if (r2 > 0.7) {
    evidence.push(`선형 모델이 데이터를 잘 설명합니다 (R² = ${r2.toFixed(3)})`);
  } else if (r2 < 0.3) {
    evidence.push(`선형 모델의 적합도가 낮아 예측 정확도가 제한적입니다`);
  }

  // Calculate forecast interval
  const stdDev = standardDeviation(yesPercentages) / 100;
  const forecastInterval = {
    lower: Math.max(0, prediction - 1.96 * stdDev),
    upper: Math.min(1, prediction + 1.96 * stdDev),
  };

  return {
    prediction,
    confidence,
    trend,
    supportingEvidence: evidence,
    technicalDetails: {
      method: 'Linear Regression',
      dataPoints,
      r2Score: r2,
      forecastInterval,
    },
  };
}

// ============================================================================
// Mock Statistical Validation
// ============================================================================

/**
 * Mock implementation of TKG Statistical Validation API
 *
 * Performs basic hypothesis testing and confidence interval calculation
 * Real TKG API would use more sophisticated statistical methods
 */
export async function mockStatisticalValidation(
  input: StatisticalValidationInput
): Promise<StatisticalValidationOutput> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));

  const { data, hypothesis } = input;

  if (!data || data.length === 0) {
    throw new Error('No data provided for validation');
  }

  // Calculate basic statistics
  const n = data.length;
  const mean = data.reduce((sum, val) => sum + val, 0) / n;
  const stdDev = standardDeviation(data);
  const stdError = stdDev / Math.sqrt(n);

  // Simple t-test (one-sample, testing if mean is different from 0.5)
  const hypothesizedMean = 0.5; // Assuming binary outcomes
  const tStatistic = (mean - hypothesizedMean) / stdError;

  // Calculate p-value (simplified, using normal approximation)
  // In reality, would use t-distribution with n-1 degrees of freedom
  const pValue = 2 * (1 - normalCDF(Math.abs(tStatistic)));

  const isStatisticallySignificant = pValue < 0.05;

  // Calculate 95% confidence interval
  const criticalValue = 1.96; // For 95% confidence, using normal approximation
  const marginOfError = criticalValue * stdError;
  const confidenceInterval = {
    lower: mean - marginOfError,
    upper: mean + marginOfError,
    level: 0.95,
  };

  // Generate analysis summary
  let summary = `데이터 샘플 크기: ${n}개\n`;
  summary += `평균: ${mean.toFixed(3)}\n`;
  summary += `표준편차: ${stdDev.toFixed(3)}\n`;
  summary += `p-value: ${pValue.toFixed(4)}\n`;

  if (isStatisticallySignificant) {
    summary += `통계적으로 유의미한 결과입니다 (p < 0.05).\n`;
    summary += `평균이 ${hypothesizedMean}와 다르다는 증거가 있습니다.`;
  } else {
    summary += `통계적으로 유의미하지 않습니다 (p ≥ 0.05).\n`;
    summary += `평균이 ${hypothesizedMean}와 다르다는 충분한 증거가 없습니다.`;
  }

  return {
    isStatisticallySignificant,
    pValue,
    confidenceInterval,
    analysisSummary: summary,
  };
}

/**
 * Normal CDF approximation (for p-value calculation)
 */
function normalCDF(x: number): number {
  // Approximation using error function
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const probability =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return x > 0 ? 1 - probability : probability;
}

// ============================================================================
// Mock API Endpoints (for testing)
// ============================================================================

/**
 * Simulates a POST request to TKG API
 */
export async function mockTKGAPICall(
  endpoint: string,
  body: any
): Promise<any> {
  // Extract API path
  const path = endpoint.split('/').pop();

  switch (path) {
    case 'forecast':
      return await mockTimeseriesForecasting(body as TimeseriesForecastingInput);

    case 'validate':
      return await mockStatisticalValidation(body as StatisticalValidationInput);

    default:
      throw new Error(`Unknown TKG API endpoint: ${endpoint}`);
  }
}
