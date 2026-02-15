"use client";

interface PersonalityCardProps {
  personality: 'SKEPTIC' | 'OPTIMIST' | 'DATA_ANALYST' | 'DOMAIN_EXPERT' | 'CONTRARIAN' | 'MEDIATOR';
}

const PERSONALITY_CONFIG = {
  SKEPTIC: {
    icon: '🔍',
    label: 'The Skeptic',
    description: 'Critical thinker who questions and verifies',
    traits: ['Rigorous evidence', 'Finds weaknesses', 'Conservative confidence'],
    color: 'blue'
  },
  OPTIMIST: {
    icon: '🚀',
    label: 'The Optimist',
    description: 'Positive analyst who sees possibilities',
    traits: ['Emphasizes positives', 'Supports innovation', 'High confidence'],
    color: 'green'
  },
  DATA_ANALYST: {
    icon: '📊',
    label: 'The Data Analyst',
    description: 'Pure statistical reasoner',
    traits: ['Quantitative evidence', 'Pattern recognition', 'Probabilistic thinking'],
    color: 'purple'
  },
  DOMAIN_EXPERT: {
    icon: '🎓',
    label: 'The Domain Expert',
    description: 'Expert in specific fields',
    traits: ['Deep expertise', 'Contextual understanding', 'Practical experience'],
    color: 'yellow'
  },
  CONTRARIAN: {
    icon: '⚡',
    label: 'The Contrarian',
    description: 'Independent thinker who challenges mainstream',
    traits: ['Alternative perspectives', 'Contrarian views', 'Bold predictions'],
    color: 'red'
  },
  MEDIATOR: {
    icon: '⚖️',
    label: 'The Mediator',
    description: 'Balanced mediator',
    traits: ['Balanced view', 'Considers both sides', 'Seeks consensus'],
    color: 'gray'
  }
};

const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400'
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400'
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400'
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400'
  },
  gray: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400'
  }
};

export function PersonalityCard({ personality }: PersonalityCardProps) {
  const config = PERSONALITY_CONFIG[personality];
  const colors = COLOR_CLASSES[config.color as keyof typeof COLOR_CLASSES];

  return (
    <div className={`p-6 ${colors.bg} border ${colors.border} rounded-xl`}>
      <div className="flex items-start gap-3 mb-4">
        <span className="text-4xl">{config.icon}</span>
        <div>
          <h3 className={`text-xl font-bold ${colors.text} mb-1`}>
            {config.label}
          </h3>
          <p className="text-sm text-slate-300">
            {config.description}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-slate-300 mb-2">Key Traits:</div>
        {config.traits.map((trait, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className={`${colors.text} mt-1`}>•</span>
            <span className="text-sm text-slate-400">{trait}</span>
          </div>
        ))}
      </div>

      <div className={`mt-4 pt-4 border-t ${colors.border} text-xs text-slate-400`}>
        This personality type tends to approach predictions with specific biases and reasoning patterns.
        Consider balancing perspectives from multiple agent types.
      </div>
    </div>
  );
}
