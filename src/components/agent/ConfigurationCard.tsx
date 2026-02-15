"use client";

interface ConfigurationCardProps {
  model: string;
  temperature?: number;
  autoParticipate: boolean;
}

const MODEL_LABELS: Record<string, { icon: string; label: string; description: string }> = {
  'claude-sonnet-4-5': {
    icon: '⚡',
    label: 'Claude 4.5 Sonnet',
    description: 'Balanced performance - Optimal for most tasks'
  },
  'claude-haiku-4-5': {
    icon: '🌿',
    label: 'Claude 4.5 Haiku',
    description: 'Fast and efficient - Quick response times'
  },
  'claude-opus-4-6': {
    icon: '🧠',
    label: 'Claude 4.6 Opus',
    description: 'Most capable - Complex reasoning and analysis'
  }
};

function getTemperatureLabel(temp: number): string {
  if (temp <= 0.3) return 'Conservative';
  if (temp <= 0.5) return 'Balanced-Conservative';
  if (temp <= 0.7) return 'Balanced';
  if (temp <= 0.9) return 'Creative';
  return 'Highly Creative';
}

export function ConfigurationCard({ model, temperature, autoParticipate }: ConfigurationCardProps) {
  const modelInfo = MODEL_LABELS[model] || {
    icon: '🤖',
    label: model,
    description: 'Custom model configuration'
  };

  return (
    <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
      <h3 className="text-lg font-bold text-white mb-4">⚙️ Configuration</h3>

      <div className="space-y-4">
        {/* Model */}
        <div>
          <div className="text-sm text-slate-400 mb-2">AI Model</div>
          <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
            <span className="text-2xl">{modelInfo.icon}</span>
            <div>
              <div className="font-semibold text-white">{modelInfo.label}</div>
              <div className="text-xs text-slate-400">{modelInfo.description}</div>
            </div>
          </div>
        </div>

        {/* Temperature */}
        {temperature !== null && temperature !== undefined && (
          <div>
            <div className="text-sm text-slate-400 mb-2">Temperature</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Conservative</span>
                <span className="font-mono text-white font-semibold">{temperature.toFixed(2)}</span>
                <span className="text-slate-500">Creative</span>
              </div>
              <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                  style={{ width: `${temperature * 100}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 text-center">
                {getTemperatureLabel(temperature)} - {
                  temperature <= 0.3 ? 'More consistent, predictable responses' :
                  temperature <= 0.7 ? 'Balanced between consistency and creativity' :
                  'More creative, varied responses'
                }
              </div>
            </div>
          </div>
        )}

        {/* Auto-participate */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Participation Mode</div>
          <div className={`p-3 rounded-lg ${autoParticipate ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-700/30'}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{autoParticipate ? '✓' : '○'}</span>
              <div>
                <div className={`text-sm font-semibold ${autoParticipate ? 'text-green-400' : 'text-slate-400'}`}>
                  {autoParticipate ? 'Auto-participate Enabled' : 'Manual Only'}
                </div>
                <div className="text-xs text-slate-500">
                  {autoParticipate ? 'Automatically participates in new predictions and debates' : 'Only participates when manually triggered'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
