import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { useT } from '../lib/useT.js'
import { CAT_BY_ID, RULES } from '../lib/constants.js'
import { localDateKey } from '../lib/date.js'
import { scoreQuest } from '../lib/scoring.js'
import { IconCheck, IconStar, IconArrow } from '../components/Icons.jsx'

export default function Report({ onDiscard, onSubmitted }) {
  const t = useT()
  const session = useStore((s) => s.session)
  const days = useStore((s) => s.days)
  const submitReport = useStore((s) => s.submitReport)
  const cancelSession = useStore((s) => s.cancelSession)

  const [minutes, setMinutes] = useState(Math.max(0, Math.round(session.elapsedMs / 60000)))
  const [note, setNote] = useState('')
  const [why, setWhy] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [proof, setProof] = useState('')
  const [showBonus, setShowBonus] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const cat = CAT_BY_ID[session.category] || CAT_BY_ID['Learning']

  const projected = useMemo(() => {
    const day = days[localDateKey()] || { quests: [], penalties: [] }
    return scoreQuest({ day, questName: session.questName, minutes, bonusInputs: { note, why, from, to, proof } })
  }, [days, session.questName, minutes, note, why, from, to, proof])

  const canBonus = minutes >= RULES.bonusMinMinutes
  const submit = () => {
    if (submitting) return
    setSubmitting(true)
    onSubmitted(submitReport({ minutes, note, why, from, to, proof }))
  }

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 32 }}
      style={{ position: 'absolute', inset: 0, zIndex: 156, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#fbf7ff,#eef2ff)' }}>
      <div style={{ textAlign: 'center', padding: '30px 20px 6px' }}>
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          style={{ width: 66, height: 66, borderRadius: 22, margin: '0 auto', display: 'grid', placeItems: 'center', color: '#fff', background: `linear-gradient(135deg,${cat.grad[0]},${cat.grad[1]})`, boxShadow: `0 14px 34px ${cat.grad[1]}55` }}>
          <IconStar style={{ width: 34, height: 34 }} />
        </motion.div>
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="h1" style={{ marginTop: 14 }}>{t('report.done')}</div>
          <div className="sub" style={{ marginTop: 4 }}>{session.questName}</div>
        </motion.div>
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        <div style={{ padding: '10px 20px 40px' }}>
          <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div className="fieldLabel" style={{ margin: '0 0 8px 0' }}>{t('report.howLong')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="ghost" style={{ padding: '8px 14px', fontSize: 18 }} onClick={() => setMinutes((m) => Math.max(0, m - 1))}>−</button>
                <div style={{ fontSize: 30, fontWeight: 800, minWidth: 46, textAlign: 'center' }}>{minutes}</div>
                <button className="ghost" style={{ padding: '8px 14px', fontSize: 18 }} onClick={() => setMinutes((m) => m + 1)}>+</button>
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '0 6px' }}>
              <div className="eyebrow">{t('report.willGet')}</div>
              <motion.div key={projected.questScore} initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ fontSize: 34, fontWeight: 800, color: 'var(--accent)', letterSpacing: -1 }}>+{projected.questScore.toFixed(1)}</motion.div>
              {projected.bonus > 0 && <div className="pill" style={{ background: 'rgba(52,211,153,0.16)', color: '#059669', fontSize: 11 }}>{t('report.bonus', { n: projected.bonus })}</div>}
            </div>
          </div>

          <motion.button onClick={() => setShowBonus((v) => !v)} className="card" whileTap={{ scale: 0.99 }} style={{ width: '100%', textAlign: 'left', padding: 16, marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent)' }}>✍️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{t('report.reflectTitle')}</div>
              <div className="sub" style={{ fontSize: 12 }}>{canBonus ? t('report.reflectSub') : t('report.reflectNeed', { min: RULES.bonusMinMinutes })}</div>
            </div>
            <motion.div animate={{ rotate: showBonus ? 90 : 0 }}><IconArrow style={{ width: 18, height: 18, color: 'var(--muted)' }} /></motion.div>
          </motion.button>

          <AnimatePresence>
            {showBonus && canBonus && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <BonusField label={t('report.note')} hint={t('report.noteHint')} value={note} set={setNote} min={20} area />
                  <BonusField label={t('report.why')} hint={t('report.whyHint')} value={why} set={setWhy} min={12} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <BonusField label={t('report.from')} hint={t('report.charHint', { n: 8 })} value={from} set={setFrom} min={8} />
                    <BonusField label={t('report.to')} hint={t('report.charHint', { n: 8 })} value={to} set={setTo} min={8} />
                  </div>
                  <BonusField label={t('report.proof')} hint={t('report.proofHint')} value={proof} set={setProof} min={10} area />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ padding: '12px 20px calc(18px + env(safe-area-inset-bottom,0px))', display: 'flex', gap: 12, background: 'linear-gradient(180deg,transparent,#eef2ff 30%)' }}>
        <motion.button whileTap={{ scale: 0.96 }} className="ghost" style={{ flex: '0 0 auto' }} onClick={() => { cancelSession(); onDiscard() }}>{t('common.discard')}</motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="cta" style={{ flex: 1 }} onClick={submit} disabled={submitting}><IconCheck style={{ width: 20, height: 20 }} /> {t('report.save')}</motion.button>
      </div>
    </motion.div>
  )
}

function BonusField({ label, hint, value, set, min, area }) {
  const ok = value.trim().length >= min
  return (
    <div>
      <div className="fieldLabel">{label}<span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: ok ? '#059669' : 'var(--muted)' }}>{ok ? '✓' : hint}</span></div>
      {area ? <textarea className="field" rows={2} value={value} onChange={(e) => set(e.target.value)} /> : <input className="field" value={value} onChange={(e) => set(e.target.value)} />}
    </div>
  )
}
