import { motion } from 'framer-motion'
import { useEffect } from 'react'
import CountUp from './CountUp.jsx'
import { useT } from '../lib/useT.js'

const COLORS = ['#5b6af0', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa']

// Full-screen reward moment with a confetti burst + counted score.
export default function Celebration({ score, bonus, gateBonus = 0, onClose }) {
  const t = useT()
  useEffect(() => {
    const t = setTimeout(onClose, 2600)
    return () => clearTimeout(t)
  }, [onClose])

  const pieces = Array.from({ length: 28 }, (_, i) => i)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 220,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(30,25,60,0.32)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      {/* confetti */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {pieces.map((i) => {
          const angle = (i / pieces.length) * Math.PI * 2
          const dist = 120 + Math.random() * 180
          return (
            <motion.div
              key={i}
              initial={{ x: '50vw', y: '46vh', opacity: 1, scale: 0 }}
              animate={{
                x: `calc(50vw + ${Math.cos(angle) * dist}px)`,
                y: `calc(46vh + ${Math.sin(angle) * dist + 120}px)`,
                opacity: 0,
                scale: 1,
                rotate: Math.random() * 540,
              }}
              transition={{ duration: 1.4 + Math.random() * 0.6, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: 10,
                height: 14,
                borderRadius: 3,
                background: COLORS[i % COLORS.length],
              }}
            />
          )
        })}
      </div>

      <motion.div
        initial={{ scale: 0.6, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="glass"
        style={{ borderRadius: 30, padding: '34px 40px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}
      >
        <motion.img
          src="/mascot.png"
          alt=""
          initial={{ scale: 0.4, rotate: -12 }}
          animate={{ scale: [0.4, 1.12, 1], rotate: [-12, 6, 0] }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'backOut' }}
          style={{ width: 96, height: 96, objectFit: 'contain', margin: '0 auto', display: 'block', filter: 'drop-shadow(0 8px 18px rgba(124,125,232,0.4))' }}
        />
        <div className="eyebrow" style={{ marginTop: 6 }}>{t('celebrate.gained')}</div>
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2, lineHeight: 1, background: 'linear-gradient(135deg,var(--accent),var(--accent3))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          +<CountUp value={score + gateBonus} duration={1100} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginTop: 12 }}>
          {bonus > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 300 }} className="pill" style={{ background: 'rgba(52,211,153,0.18)', color: '#059669' }}>{t('celebrate.bonus', { n: bonus })}</motion.div>
          )}
          {gateBonus > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.65, type: 'spring', stiffness: 300 }} className="pill" style={{ background: 'rgba(245,158,11,0.18)', color: '#b45309' }}>{t('gate.bonusToast', { n: gateBonus })}</motion.div>
          )}
        </div>
        <div className="sub" style={{ marginTop: 14, fontSize: 12.5 }}>{t('celebrate.tap')}</div>
      </motion.div>
    </motion.div>
  )
}
