import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { useT } from '../lib/useT.js'
import { STORE_ITEMS, RULES, GATE_RULES } from '../lib/constants.js'
import { dayEffective, lifetimePoints, levelFromPoints, levelProgress } from '../lib/scoring.js'
import { localDateKey, fmtClock } from '../lib/date.js'
import Mascot from '../components/Mascot.jsx'
import CountUp from '../components/CountUp.jsx'
import { IconFlame, IconArrow, IconBolt, IconStar } from '../components/Icons.jsx'
import { toast } from '../components/Toast.jsx'

const container = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } }
const item = { hidden: { y: 22, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 24 } } }

function greeting(t, score) {
  const h = new Date().getHours()
  let period = t('period.night')
  if (h >= 5 && h < 12) period = t('period.morning')
  else if (h >= 12 && h < 17) period = t('period.afternoon')
  else if (h >= 17 && h < 21) period = t('period.evening')
  const s = (Number(score) || 0).toFixed(1)
  let bucket = 'zero'
  const n = Number(score) || 0
  if (n >= 100) bucket = 'max'
  else if (n >= 60) bucket = 'near'
  else if (n >= 25) bucket = 'mid'
  else if (n > 0) bucket = 'low'
  return { prefix: t(`home.g.${bucket}`), sub: t(`home.g.${bucket}Sub`, { s, period }) }
}

export default function Home({ onNavigate, onStartQuest, onOpenMenu }) {
  const t = useT()
  const days = useStore((s) => s.days)
  const name = useStore((s) => s.profile.name)
  const setName = useStore((s) => s.setName)
  const streak = useStore((s) => s.streak())
  const equipped = useStore((s) => s.wallet.equipped)
  const settings = useStore((s) => s.settings)
  const gate = useStore((s) => s.gate)
  const gateStatus = useStore((s) => s.gateStatus)
  const gateUnlock = useStore((s) => s.gateUnlock)
  const breakState = useStore((s) => s.breakState)
  const breakOverPenalty = useStore((s) => s.breakOverPenalty)
  const schedule = useStore((s) => s.schedule)

  // live tick for countdowns (gate armed / break)
  const [, setNow] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const todayKey = localDateKey()
  const score = dayEffective(days[todayKey])
  const lifetime = lifetimePoints(days)
  const level = levelFromPoints(lifetime)
  const lvlProg = levelProgress(lifetime)
  const g = greeting(t, score)
  const pct = Math.min(100, (score / RULES.dayGoal) * 100)

  const gs = gateStatus()
  const btnItem = STORE_ITEMS.find((i) => i.id === equipped.startBtn)
  const btnBg = btnItem?.swatch || 'linear-gradient(135deg,var(--accent),var(--accent2))'
  const isFire = btnItem?.fire

  const editName = () => { const nn = window.prompt(t('home.namePrompt'), name); if (nn) setName(nn) }

  return (
    <motion.div className="page-pad" variants={container} initial="hidden" animate="show">
      {/* header */}
      <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/logo-192.png" alt="" style={{ width: 32, height: 32, borderRadius: 10, boxShadow: 'var(--shadow-sm)' }} />
          <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>Sakura<span style={{ color: 'var(--accent)' }}>Q</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div className="pill" whileTap={{ scale: 0.94 }} style={{ background: 'rgba(244,114,182,0.14)', color: '#db2777' }}>
            <IconFlame style={{ width: 15, height: 15 }} /> {t('home.streakDays', { n: streak })}
          </motion.div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onOpenMenu} className="card" style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center' }} aria-label={t('menu.title')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </motion.button>
        </div>
      </motion.div>

      {/* hero */}
      <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <div style={{ flexShrink: 0 }}><Mascot size={140} /></div>
        <div className="glass" style={{ flex: 1, borderRadius: 22, padding: '15px 17px' }}>
          <div style={{ fontWeight: 800, fontSize: 16.5 }}>
            {g.prefix}{' '}
            <button onClick={editName} style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 16.5, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationStyle: 'dotted' }}>{name}</button>
          </div>
          <div className="sub" style={{ marginTop: 4, lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: g.sub }} />
        </div>
      </motion.div>

      {/* ── GATE LOCKED: replaces progress + start ── */}
      {gs.state === 'locked' ? (
        <motion.div variants={item} className="card" style={{ padding: 24, marginTop: 16, textAlign: 'center', border: '2px solid rgba(244,63,94,0.4)', background: 'linear-gradient(160deg,#fff,#fff5f6)' }}>
          <div style={{ fontSize: 44 }}>🔒</div>
          <div className="h2" style={{ marginTop: 8, color: 'var(--bad)' }}>{t('gate.locked')}</div>
          <div className="sub" style={{ marginTop: 6 }}>{t('gate.lockedSub', { n: gs.daysLeft })}</div>
          <motion.button whileTap={{ scale: 0.96 }} className="ghost" style={{ marginTop: 16, color: 'var(--accent)' }}
            onClick={() => { if (confirm(t('gate.unlockConfirm'))) { gateUnlock(); toast(t('common.done'), 'good') } }}>
            {t('gate.unlock')}
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* banners */}
          <AnimatePresence>
            {gs.state === 'armed' && (
              <Banner key="gate-armed" tint="#f59e0b" bg="linear-gradient(135deg,#fef3c7,#fde68a)">
                <div style={{ fontWeight: 800, color: '#b45309' }}>🌅 {t('gate.armed')}</div>
                <div className="sub" style={{ fontSize: 12, color: '#92400e' }}>{t('gate.armedSub', { time: fmtClock(Math.ceil(gs.msLeft / 1000)), q: GATE_RULES.qualifyMin })}</div>
              </Banner>
            )}
            {gs.state === 'passed' && (
              <Banner key="gate-passed" tint="#059669" bg="linear-gradient(135deg,#d1fae5,#a7f3d0)">
                <div style={{ fontWeight: 800, color: '#047857' }}>✓ {t('gate.passed')}</div>
              </Banner>
            )}
            {breakState.active && (
              <BreakBanner key="break" t={t} breakState={breakState} penalty={breakOverPenalty()} />
            )}
            {schedule.length > 0 && (
              <Banner key="plan" tint="var(--accent)" bg="var(--accent-soft)" onClick={onOpenMenu}>
                <div style={{ fontWeight: 800, color: 'var(--accent)' }}>🎯 {t('sched.banner', { n: schedule.length })}</div>
              </Banner>
            )}
          </AnimatePresence>

          {/* progress */}
          <motion.div variants={item} className="card" style={{ padding: 22, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div className="eyebrow">{t('home.today')}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 46, fontWeight: 800, lineHeight: 1, letterSpacing: -1.5 }}><CountUp value={score} /></span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--muted)' }}>/ {RULES.dayGoal}</span>
                </div>
              </div>
              <motion.button onClick={() => onNavigate('today')} whileTap={{ scale: 0.95 }} className="pill">
                {t('home.viewToday')} <IconArrow style={{ width: 14, height: 14 }} />
              </motion.button>
            </div>
            <div className="track" style={{ marginTop: 16 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.2 }} />
            </div>
          </motion.div>

          {/* stat chips */}
          <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <StatChip Icon={IconStar} tint="#f59e0b" label={t('home.level')} value={`Lv.${level}`} sub={t('home.lvPts', { n: lvlProg.toFixed(0) })} onClick={() => onNavigate('history')} />
            <StatChip Icon={IconBolt} tint="var(--accent)" label={t('home.lifetime')} value={<CountUp value={lifetime} />} sub={t('home.lifetimeSub')} onClick={() => onNavigate('store')} />
          </motion.div>

          {/* start CTA */}
          <motion.div variants={item} style={{ marginTop: 22, position: 'relative' }}>
            {isFire && <FireFX />}
            <motion.button onClick={onStartQuest} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="cta" style={{ background: btnBg, animation: 'pulseGlow 3.2s ease-in-out infinite', position: 'relative', zIndex: 2 }}>
              <span style={{ fontSize: 17 }}>{t('home.start')}</span>
              <IconArrow style={{ width: 20, height: 20 }} />
            </motion.button>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

function Banner({ children, tint, bg, onClick }) {
  return (
    <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 14 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} onClick={onClick} style={{ overflow: 'hidden' }}>
      <div style={{ padding: '13px 16px', borderRadius: 18, background: bg, borderLeft: `4px solid ${tint}`, cursor: onClick ? 'pointer' : 'default' }}>{children}</div>
    </motion.div>
  )
}

function BreakBanner({ t, breakState, penalty }) {
  const now = Date.now()
  const resting = now < breakState.breakEndTs
  const over = now > breakState.graceEndTs
  const leftSec = Math.max(0, Math.ceil((breakState.breakEndTs - now) / 1000))
  const tint = over ? '#f43f5e' : resting ? '#059669' : '#f59e0b'
  const bg = over ? 'linear-gradient(135deg,#ffe4e6,#fecdd3)' : resting ? 'linear-gradient(135deg,#d1fae5,#a7f3d0)' : 'linear-gradient(135deg,#fef3c7,#fde68a)'
  return (
    <Banner tint={tint} bg={bg}>
      {over ? (
        <>
          <div style={{ fontWeight: 800, color: '#be123c' }}>⚠️ {t('break.over')}</div>
          {penalty > 0 && <div className="sub" style={{ fontSize: 12, color: '#9f1239' }}>{t('break.overSub', { n: penalty })}</div>}
        </>
      ) : resting ? (
        <>
          <div style={{ fontWeight: 800, color: '#047857' }}>☕ {t('break.resting')} · {fmtClock(leftSec)}</div>
          <div className="sub" style={{ fontSize: 12, color: '#065f46' }}>{t('break.restLabel')}</div>
        </>
      ) : (
        <div style={{ fontWeight: 800, color: '#b45309' }}>⏰ {t('break.grace')}</div>
      )}
    </Banner>
  )
}

function FireFX() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'visible' }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.div key={i}
          animate={{ y: [-2, -22, -2], opacity: [0.9, 0.2, 0.9], scaleY: [1, 1.5, 1] }}
          transition={{ duration: 0.8 + (i % 3) * 0.2, repeat: Infinity, delay: i * 0.09, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: '72%', left: `${8 + i * 10}%`, width: 12, height: 18, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: i % 2 ? 'linear-gradient(#fbbf24,#f97316)' : 'linear-gradient(#fde68a,#ef4444)', filter: 'blur(1px)' }} />
      ))}
    </div>
  )
}

function StatChip({ Icon, tint, label, value, sub, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.96 }} onClick={onClick} className="card" style={{ padding: 15, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 30, height: 30, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: tint }}><Icon style={{ width: 18, height: 18 }} /></span>
        <span className="sub" style={{ fontWeight: 700, fontSize: 12.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>{value}</div>
      <div className="sub" style={{ fontSize: 11.5 }}>{sub}</div>
    </motion.button>
  )
}
