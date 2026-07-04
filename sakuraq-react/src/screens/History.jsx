import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { useT } from '../lib/useT.js'
import { CAT_BY_ID, RULES } from '../lib/constants.js'
import { localDateKey, addDays, shortLabel, weekdayLabel, round1 } from '../lib/date.js'
import { dayEffective, lifetimePoints, levelFromPoints } from '../lib/scoring.js'
import CountUp from '../components/CountUp.jsx'
import { catIcon, IconFlame, IconStar, IconBolt } from '../components/Icons.jsx'

const RANGE = 14

export default function History() {
  const t = useT()
  const days = useStore((s) => s.days)
  const streak = useStore((s) => s.streak())

  const today = localDateKey()
  const [selected, setSelected] = useState(today)

  const series = useMemo(() => {
    const arr = []
    for (let i = RANGE - 1; i >= 0; i--) {
      const key = addDays(today, -i)
      arr.push({ key, value: dayEffective(days[key]), count: (days[key]?.quests || []).length })
    }
    return arr
  }, [days, today])

  const max = Math.max(RULES.dayGoal, ...series.map((d) => d.value))
  const activeDays = series.filter((d) => d.value > 0).length
  const rangeTotal = round1(series.reduce((s, d) => s + d.value, 0))
  const avg = activeDays ? round1(rangeTotal / activeDays) : 0
  const best = Math.max(0, ...series.map((d) => d.value))
  const lifetime = lifetimePoints(days)
  const level = levelFromPoints(lifetime)

  const selDay = days[selected] || { quests: [] }
  const selQuests = [...(selDay.quests || [])].sort((a, b) => b.ts - a.ts)

  return (
    <div className="page-pad">
      <div className="eyebrow">{t('history.eyebrow')}</div>
      <div className="h1" style={{ marginTop: 2 }}>{t('history.title')}</div>

      {/* stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
        <MiniStat Icon={IconFlame} tint="#db2777" value={streak} label={t('history.streak')} />
        <MiniStat Icon={IconStar} tint="#f59e0b" value={`Lv.${level}`} label={t('history.level')} />
        <MiniStat Icon={IconBolt} tint="var(--accent)" value={<CountUp value={lifetime} decimals={0} />} label={t('history.lifetime')} />
      </div>

      {/* chart */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card" style={{ padding: '20px 16px 14px', marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px' }}>
          <div style={{ fontWeight: 800 }}>{t('history.range', { n: RANGE })}</div>
          <div className="sub" style={{ fontWeight: 700 }}>{t('history.avg', { n: avg })}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 150, marginTop: 16 }}>
          {series.map((d, i) => {
            const h = max > 0 ? (d.value / max) * 100 : 0
            const on = d.key === selected
            const isToday = d.key === today
            return (
              <button
                key={d.key}
                onClick={() => setSelected(d.key)}
                style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 5 }}
              >
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(h, d.value > 0 ? 6 : 2)}%` }}
                    transition={{ delay: i * 0.03, type: 'spring', stiffness: 120, damping: 18 }}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      background: on
                        ? 'linear-gradient(180deg,var(--accent),var(--accent2))'
                        : d.value > 0
                          ? 'linear-gradient(180deg,#c7cbff,#a5abff)'
                          : 'var(--accent-soft)',
                      boxShadow: on ? '0 6px 16px rgba(91,106,240,0.4)' : 'none',
                    }}
                  />
                  {on && d.value > 0 && (
                    <motion.div layoutId="barLabel" style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 800, color: 'var(--accent)' }}>
                      {d.value}
                    </motion.div>
                  )}
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: isToday ? 'var(--accent)' : 'var(--muted)' }}>{weekdayLabel(d.key)}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* selected day detail */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="h2">{selected === today ? t('history.today') : shortLabel(selected)}</div>
          <div className="pill">{dayEffective(selDay)} {t('common.points')}</div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ marginTop: 12 }}
          >
            {selQuests.length === 0 ? (
              <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 30 }}>💤</div>
                <div className="sub" style={{ marginTop: 6 }}>{t('history.noQuest')}</div>
              </div>
            ) : (
              selQuests.map((q) => {
                const c = CAT_BY_ID[q.category] || CAT_BY_ID['Learning']
                const Icon = catIcon(q.category)
                return (
                  <div key={q.ts} className="card" style={{ padding: 13, marginBottom: 9, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: 'grid', placeItems: 'center', color: '#fff', background: `linear-gradient(135deg,${c.grad[0]},${c.grad[1]})` }}>
                      <Icon style={{ width: 19, height: 19 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.questName}</div>
                      <div className="sub" style={{ fontSize: 12 }}>{q.minutesSpent} {t('common.min')}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--accent)' }}>+{q.questScore.toFixed(1)}</div>
                  </div>
                )
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function MiniStat({ Icon, tint, value, label }) {
  return (
    <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
      <div style={{ width: 30, height: 30, margin: '0 auto', borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: tint }}>
        <Icon style={{ width: 17, height: 17 }} />
      </div>
      <div style={{ fontSize: 19, fontWeight: 800, marginTop: 7, letterSpacing: -0.5 }}>{value}</div>
      <div className="sub" style={{ fontSize: 11 }}>{label}</div>
    </motion.div>
  )
}
