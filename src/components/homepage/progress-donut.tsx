'use client'

interface ProgressDonutProps {
  completed: number
  total: number
  size?: number
  strokeWidth?: number
}

export function ProgressDonut({
  completed,
  total,
  size = 120,
  strokeWidth = 10,
}: ProgressDonutProps) {
  const center = size / 2
  const radius = center - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const ratio = total === 0 ? 0 : completed / total
  const dashOffset = circumference * (1 - ratio)

  const strokeColor =
    ratio >= 1
      ? 'stroke-green-500'
      : ratio >= 0.5
        ? 'stroke-orange-500'
        : 'stroke-red-500'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="absolute text-lg font-bold text-foreground">
        {completed}/{total}
      </span>
    </div>
  )
}
