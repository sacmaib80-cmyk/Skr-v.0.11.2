import { motion } from 'framer-motion'

/**
 * Animated circular progress ring.
 * progress: 0..1 (fraction remaining shown as filled arc)
 * grad: [from, to] gradient colours
 */
export default function ProgressRing({
  size = 268,
  stroke = 16,
  progress = 1,
  grad = ['#5b6af0', '#a78bfa'],
  glow = true,
  children,
  paused = false,
  gradId = 'ringGrad',
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.max(0, Math.min(1, progress))
  const offset = c * (1 - p)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* rotating soft glow behind the ring */}
      {glow && (
        <div
          style={{
            position: 'absolute',
            inset: -14,
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${grad[0]}55, ${grad[1]}22, ${grad[0]}55)`,
            filter: 'blur(22px)',
            opacity: 0.9,
            animation: paused ? 'none' : 'spinSlow 8s linear infinite',
            zIndex: 0,
          }}
        />
      )}
      <svg width={size} height={size} style={{ position: 'relative', zIndex: 1, transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={grad[0]} />
            <stop offset="60%" stopColor={grad[1]} />
            <stop offset="100%" stopColor={grad[0]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(91,106,240,0.12)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          style={{ filter: glow ? `drop-shadow(0 0 10px ${grad[1]}88)` : 'none' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}
