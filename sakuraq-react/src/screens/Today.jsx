import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { useT } from '../lib/useT.js'
import { CAT_BY_ID, CATEGORIES, RULES } from '../lib/constants.js'
import { localDateKey, timeAgo } from '../lib/date.js'
import { dayEffective } from '../lib/scoring.js'
import { catIcon, IconTrash } from '../components/Icons.jsx'
import CountUp from '../components/CountUp.jsx'
import { toast } from '../components/Toast.jsx'

export default function Today() {
  const t = useT()
  const days = useStore((s) => s.days)
  const deleteQuest = useStore((s) => s.deleteQuest)

  const key = localDateKey()
  const day = days[key] || { quests: [], penalties: [] }
  const quests = [...(day.quests || [])].sort((a, b) => b.ts - a.ts)
  const penalties = day.penalties || []
  const total = dayEffective(day)

  const byCat = CATEGORIES.map((c) => {
    const pts = quests.filter((q) => q.category === c.id).reduce((s, q) => s + q.questScore, 0)
    return { ...c, pts: Math.round(pts * 10) / 10 }
  }).filter((c) => c.pts > 0)

  return (
    <div className="page-pad">
      <div className="eyebrow">{t('today.eyebrow')}</div>
      <div className="h1" style={{ marginTop: 2 }}>{t('today.title')}</div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} className="card" style={{ padding: 22, marginTop: 14, textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(300px 160px at 50% 0%, var(--accent-soft), transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}><CountUp value={total} /></div>
          <div className="sub" style={{ fontWeight: 700 }}>{t('today.fromGoal', { goal: RULES.dayGoal, n: quests.length })}</div>
          <div className="track" style={{ marginTop: 16 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, total)}%` }} transition={{ delay: 0.2, type: 'spring', stiffness: 90, damping: 20 }} />
          </div>
        </div>
      </motion.div>

      {byCat.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {byCat.map((c, i) => (
            <motion.div key={c.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }} className="pill" style={{ background: c.soft, color: c.color }}>{t('cat.' + c.id)} · {c.pts}</motion.div>
          ))}
        </div>
      )}

      {/* penalties */}
      {penalties.map((p) => (
        <div key={p.ts} className="card" style={{ padding: 14, marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg,#fff,#fff5f6)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(244,63,94,0.12)', fontSize: 20 }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--bad)' }}>{t('today.penalty')}</div>
            <div className="sub" style={{ fontSize: 12 }}>{timeAgo(p.ts)}</div>
          </div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--bad)' }}>−{p.pts}</div>
        </div>
      ))}

      <div style={{ marginTop: 20 }}>
        {quests.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            <motion.img src="/mascot.png" alt="" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ width: 120, height: 120, objectFit: 'contain', margin: '0 auto', opacity: 0.92 }} />
            <div style={{ fontWeight: 700, marginTop: 8, color: 'var(--ink2)' }}>{t('today.empty')}</div>
            <div className="sub" style={{ marginTop: 4 }}>{t('today.emptySub')}</div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {quests.map((q) => {
              const c = CAT_BY_ID[q.category] || CAT_BY_ID['Learning']
              const Icon = catIcon(q.category)
              return (
                <motion.div key={q.ts} layout initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0, height: 0, marginBottom: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="card" style={{ padding: 15, marginBottom: 11, display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, display: 'grid', placeItems: 'center', color: '#fff', background: `linear-gradient(135deg,${c.grad[0]},${c.grad[1]})` }}><Icon style={{ width: 22, height: 22 }} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.questName}</div>
                    <div className="sub" style={{ fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>{q.minutesSpent} {t('common.min')}</span><span>·</span><span>{timeAgo(q.ts)}</span>
                      {q.bonus > 0 && <span style={{ color: '#059669', fontWeight: 700 }}>+{q.bonus}</span>}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent)', flexShrink: 0 }}>+{q.questScore.toFixed(1)}</div>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => { deleteQuest(key, q.ts); toast(t('today.deleted')) }} style={{ color: 'var(--muted)', padding: 6, flexShrink: 0 }}><IconTrash style={{ width: 18, height: 18 }} /></motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
