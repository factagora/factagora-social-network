"use client";

interface TrustScoreBreakdown {
  accuracy: number;        // 0-100
  consistency: number;     // 0-100
  activity: number;        // 0-100
  transparency: number;    // 0-100
}

interface TrustScoreSectionProps {
  overallScore: number;    // 0-100
  breakdown: TrustScoreBreakdown;
  expertiseAreas?: Array<{
    category: string;
    accuracy: number;
    predictionCount: number;
  }>;
}

function getTrustBadge(score: number): { emoji: string; label: string; color: string } {
  if (score >= 90) return { emoji: '⭐⭐⭐', label: 'Expert', color: 'text-yellow-400' };
  if (score >= 75) return { emoji: '⭐⭐', label: 'Trusted', color: 'text-blue-400' };
  if (score >= 60) return { emoji: '⭐', label: 'Reliable', color: 'text-green-400' };
  if (score >= 40) return { emoji: '◐', label: 'Developing', color: 'text-slate-400' };
  return { emoji: '○', label: 'New', color: 'text-slate-500' };
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'from-yellow-500 to-orange-500';
  if (score >= 75) return 'from-blue-500 to-purple-500';
  if (score >= 60) return 'from-green-500 to-emerald-500';
  return 'from-slate-500 to-slate-600';
}

export function TrustScoreSection({ overallScore, breakdown, expertiseAreas }: TrustScoreSectionProps) {
  const badge = getTrustBadge(overallScore);
  const scoreGradient = getScoreColor(overallScore);

  return (
    <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Trust & Credibility</h2>

      {/* Overall Trust Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{badge.emoji}</span>
            <div>
              <div className={`text-2xl font-bold ${badge.color}`}>{badge.label}</div>
              <div className="text-sm text-slate-400">Trust Level</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">{overallScore}</div>
            <div className="text-sm text-slate-400">/100</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${scoreGradient} transition-all duration-500`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="text-sm font-semibold text-slate-300 mb-3">Score Breakdown:</div>

        {/* Accuracy */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-400">Accuracy</span>
            <span className="text-sm font-semibold text-white">{breakdown.accuracy}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              style={{ width: `${breakdown.accuracy}%` }}
            />
          </div>
        </div>

        {/* Consistency */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-400">Consistency</span>
            <span className="text-sm font-semibold text-white">{breakdown.consistency}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              style={{ width: `${breakdown.consistency}%` }}
            />
          </div>
        </div>

        {/* Activity */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-400">Activity</span>
            <span className="text-sm font-semibold text-white">{breakdown.activity}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${breakdown.activity}%` }}
            />
          </div>
        </div>

        {/* Transparency */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-400">Transparency</span>
            <span className="text-sm font-semibold text-white">{breakdown.transparency}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              style={{ width: `${breakdown.transparency}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expertise Areas */}
      {expertiseAreas && expertiseAreas.length > 0 && (
        <div className="pt-6 border-t border-slate-700">
          <div className="text-sm font-semibold text-slate-300 mb-3">Expertise Areas:</div>
          <div className="space-y-3">
            {expertiseAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {area.accuracy >= 85 && <span className="text-yellow-400">🏆</span>}
                  <span className="text-sm text-white">{area.category}</span>
                  <span className="text-xs text-slate-500">
                    ({area.predictionCount} prediction{area.predictionCount !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        area.accuracy >= 85
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : area.accuracy >= 70
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-slate-500 to-slate-600'
                      }`}
                      style={{ width: `${area.accuracy}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white w-12 text-right">
                    {area.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Score Formula Info */}
      <div className="mt-6 pt-6 border-t border-slate-700 text-xs text-slate-500">
        <div className="flex items-start gap-2">
          <span>ℹ️</span>
          <div>
            <div className="font-semibold text-slate-400 mb-1">Trust Score Calculation:</div>
            <div>Accuracy (35%) + Consistency (25%) + Activity (15%) + Reputation (15%) + Transparency (10%)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
