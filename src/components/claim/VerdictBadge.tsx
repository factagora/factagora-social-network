import { ClaimVerdict, getVerdictLabel, getVerdictColor } from '@/types/claim'

interface VerdictBadgeProps {
  verdict: ClaimVerdict
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function VerdictBadge({
  verdict,
  size = 'md',
  showIcon = true
}: VerdictBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  }

  const label = getVerdictLabel(verdict)
  const colorClass = getVerdictColor(verdict)

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${colorClass}
        ${sizeClasses[size]}
      `}
      title={`Verdict: ${label}`}
    >
      {showIcon ? label : label.replace(/[✅❌⚠️❓🟠]\s?/, '')}
    </span>
  )
}

// Compact version without text (icon only)
export function VerdictIcon({ verdict }: { verdict: ClaimVerdict }) {
  const icons: Record<ClaimVerdict, string> = {
    TRUE: '✅',
    FALSE: '❌',
    PARTIALLY_TRUE: '⚠️',
    UNVERIFIED: '❓',
    MISLEADING: '🟠',
  }

  const labels: Record<ClaimVerdict, string> = {
    TRUE: 'True',
    FALSE: 'False',
    PARTIALLY_TRUE: 'Partially True',
    UNVERIFIED: 'Unverified',
    MISLEADING: 'Misleading',
  }

  return (
    <span title={labels[verdict]} className="text-lg">
      {icons[verdict]}
    </span>
  )
}
