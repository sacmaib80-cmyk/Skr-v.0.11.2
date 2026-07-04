import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { useT } from '../lib/useT.js'
import { CAT_BY_ID } from '../lib/constants.js'
import { fmtClock } from '../lib/date.js'
import ProgressRing from '../components/ProgressRing.jsx'
import { catIcon, IconPause, IconPlay, IconStop } from '../components/Icons.jsx'

export default function Run() {
  const t = useT()
  const session = useStore((s) => s.session)
  const pauseQuest = useStore((s) => s.pauseQuest)
  const resumeQuest = useStore((s) => s.resumeQuest)
  const extendQuest = useStore((s) => s.extendQuest)
  const stopQuest = useStore((s) => s.stopQuest)

  const [now, setNow] = useState(Date.now())

  // 250ms tick while running (matches the original loop cadence)
  useEffect(() => {
    if (session.status !== 'running') return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [session.status])

  const totalMs = session.plannedMin * 60000
  const remainingMs =
    session.status === 'running' ? Math.max(0, session.targetEndTs - now) : session.remainingMs
  const remainingSec = Math.ceil(remainingMs / 1000)
  const progress = totalMs > 0 ? remainingMs / totalMs : 0
  const paused = session.status === 'paused'
  const overtime = remainingMs <= 0

  const cat = CAT_BY_ID[session.category] || CAT_BY_ID['Learning']
  const Icon = catIcon(session.category)
  const grad = cat.grad

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 140,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 22px calc(30px + env(safe-area-inset-bottom,0px))',
        background: `radial-gradient(600px 500px at 50% 18%, ${grad[0]}18, transparent 62%), linear-gradient(180deg,#f7f8ff,#eef2ff)`,
      }}
    >
      {/* category chip */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pill"
        style={{ background: cat.soft, color: cat.color, fontSize: 14, padding: '10px 18px', marginTop: 8 }}
      >
        <Icon style={{ width: 16, height: 16 }} /> {t('cat.' + session.category)}
      </motion.div>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        style={{ fontWeight: 800, fontSize: 19, marginTop: 14, textAlign: 'center', maxWidth: 320, letterSpacing: -0.3 }}
      >
        {session.questName}
      </motion.div>

      {/* ring */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <ProgressRing size={286} stroke={18} progress={progress} grad={grad} paused={paused} gradId="runGrad">
          <motion.div
            key={paused ? 'p' : 'r'}
            animate={overtime ? { scale: [1, 1.04, 1] } : {}}
            transition={{ duration: 1, repeat: overtime ? Infinity : 0 }}
            style={{ fontSize: 60, fontWeight: 800, letterSpacing: -2, color: overtime ? 'var(--bad)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}
          >
            {overtime ? '+' + fmtClock(-remainingSec) : fmtClock(remainingSec)}
          </motion.div>
          <div className="pill" style={{ marginTop: 8, background: paused ? 'rgba(245,158,11,0.16)' : cat.soft, color: paused ? '#b45309' : cat.color }}>
            {paused ? t('run.paused') : overtime ? t('run.overtime') : t('run.focus')}
          </div>
        </ProgressRing>
      </div>

      {/* extend pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {[5, 10].map((m) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.92 }}
            onClick={() => extendQuest(m)}
            className="pill"
            style={{ background: 'var(--card)', boxShadow: 'var(--shadow-sm)', color: 'var(--ink2)', padding: '11px 18px' }}
          >
            +{m} {t('common.min')}
          </motion.button>
        ))}
      </div>

      {/* controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={paused ? resumeQuest : pauseQuest}
          style={{
            width: 66,
            height: 66,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--accent)',
            background: 'var(--card)',
            boxShadow: 'var(--shadow)',
          }}
        >
          {paused ? <IconPlay style={{ width: 26, height: 26 }} /> : <IconPause style={{ width: 26, height: 26 }} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={stopQuest}
          style={{
            padding: '18px 40px',
            borderRadius: 22,
            color: '#fff',
            fontWeight: 800,
            fontSize: 16.5,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'linear-gradient(135deg,#fb7185,#f43f5e)',
            boxShadow: '0 16px 40px rgba(244,63,94,0.36)',
          }}
        >
          <IconStop style={{ width: 20, height: 20 }} /> {t('run.end')}
        </motion.button>
      </div>
    </motion.div>
  )
}
