import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { useT } from '../lib/useT.js'
import { CATEGORIES, CAT_BY_ID, DURATION_PRESETS } from '../lib/constants.js'
import { catIcon, IconBack, IconPlay, IconTrash } from '../components/Icons.jsx'
import { toast } from '../components/Toast.jsx'

export default function Schedule({ onClose, onStarted }) {
  const t = useT()
  const schedule = useStore((s) => s.schedule)
  const addPlan = useStore((s) => s.addPlan)
  const removePlan = useStore((s) => s.removePlan)
  const startQuest = useStore((s) => s.startQuest)

  const [cat, setCat] = useState('Learning')
  const [name, setName] = useState('')
  const [mins, setMins] = useState(25)

  const add = () => {
    if (!name.trim()) return
    addPlan({ category: cat, questName: name.trim(), plannedMin: mins })
    setName('')
    toast(t('sched.added'), 'good')
  }

  const start = (plan) => {
    const r = startQuest({ category: plan.category, questName: plan.questName, plannedMin: plan.plannedMin, fromPlanId: plan.id })
    if (r.ok) onStarted()
  }

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{ position: 'absolute', inset: 0, zIndex: 135, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#f7f8ff,#eef2ff)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '22px 20px 8px' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="ghost" style={{ padding: 11, borderRadius: 14 }}>
          <IconBack style={{ width: 20, height: 20 }} />
        </motion.button>
        <div>
          <div className="h1">{t('sched.title')}</div>
          <div className="sub">{t('sched.desc')}</div>
        </div>
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        <div style={{ padding: '10px 20px 40px' }}>
          {/* add form */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {CATEGORIES.map((c) => {
                const Icon = catIcon(c.id)
                const on = cat === c.id
                return (
                  <motion.button key={c.id} whileTap={{ scale: 0.94 }} onClick={() => setCat(c.id)} className="pill" style={on ? { background: `linear-gradient(135deg,${c.grad[0]},${c.grad[1]})`, color: '#fff' } : { background: c.soft, color: c.color }}>
                    <Icon style={{ width: 14, height: 14 }} /> {t('cat.' + c.id)}
                  </motion.button>
                )
              })}
            </div>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('sched.namePh')} onKeyDown={(e) => e.key === 'Enter' && add()} maxLength={60} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
              {DURATION_PRESETS.map((d) => (
                <motion.button key={d} whileTap={{ scale: 0.93 }} onClick={() => setMins(d)} className="pill" style={mins === d ? { background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff' } : { background: 'var(--card-2)', color: 'var(--ink2)', boxShadow: 'var(--shadow-sm)' }}>
                  {d} {t('common.min')}
                </motion.button>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} className="cta" onClick={add} disabled={!name.trim()}>+ {t('sched.add')}</motion.button>
          </div>

          {/* plan list */}
          <div style={{ marginTop: 18 }}>
            {schedule.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40 }}>🎯</div>
                <div style={{ fontWeight: 700, marginTop: 8, color: 'var(--ink2)' }}>{t('sched.empty')}</div>
                <div className="sub" style={{ marginTop: 4 }}>{t('sched.emptySub')}</div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {schedule.map((p) => {
                  const c = CAT_BY_ID[p.category] || CAT_BY_ID['Learning']
                  const Icon = catIcon(p.category)
                  return (
                    <motion.div key={p.id} layout initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0, height: 0, marginBottom: 0 }} className="card" style={{ padding: 13, marginBottom: 11, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'grid', placeItems: 'center', color: '#fff', background: `linear-gradient(135deg,${c.grad[0]},${c.grad[1]})` }}>
                        <Icon style={{ width: 20, height: 20 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.questName}</div>
                        <div className="sub" style={{ fontSize: 12 }}>{p.plannedMin} {t('common.min')}</div>
                      </div>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => removePlan(p.id)} style={{ color: 'var(--muted)', padding: 6 }}><IconTrash style={{ width: 17, height: 17 }} /></motion.button>
                      <motion.button whileTap={{ scale: 0.94 }} onClick={() => start(p)} style={{ padding: '9px 16px', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,var(--accent),var(--accent2))' }}>
                        <IconPlay style={{ width: 14, height: 14 }} /> {t('sched.start')}
                      </motion.button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
