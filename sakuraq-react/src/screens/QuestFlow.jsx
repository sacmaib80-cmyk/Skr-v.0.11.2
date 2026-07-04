import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { useT } from '../lib/useT.js'
import { CATEGORIES, DURATION_PRESETS, QUEST_POOLS, QUEST_POOLS_EN, DICE_DURATIONS, STORE_ITEMS } from '../lib/constants.js'
import { catIcon, IconBack, IconArrow, IconPlay } from '../components/Icons.jsx'

const overlay = { hidden: { opacity: 0 }, show: { opacity: 1 } }
const stepV = { enter: { x: 60, opacity: 0 }, center: { x: 0, opacity: 1 }, exit: { x: -60, opacity: 0 } }
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)]

export default function QuestFlow({ onClose, onStarted }) {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const [step, setStep] = useState(0)
  const [cat, setCat] = useState(null)
  const [name, setName] = useState('')
  const [mins, setMins] = useState(25)
  const [rolling, setRolling] = useState(false)

  const startQuest = useStore((s) => s.startQuest)
  const history = useStore((s) => s.questNameHistory)
  const equippedDice = useStore((s) => s.wallet.equipped.dice)
  const catObj = CATEGORIES.find((c) => c.id === cat)
  const diceImg = STORE_ITEMS.find((i) => i.id === equippedDice)?.img

  const back = () => { if (step === 0) onClose(); else setStep((s) => s - 1) }
  const go = () => {
    const r = startQuest({ category: cat, questName: name.trim() || t('cat.' + cat), plannedMin: mins })
    if (r.ok) onStarted()
  }

  const rollDice = () => {
    setRolling(true)
    const c = rnd(CATEGORIES).id
    const pool = (lang === 'en' ? QUEST_POOLS_EN : QUEST_POOLS)[c]
    setTimeout(() => {
      setCat(c)
      setName(rnd(pool))
      setMins(rnd(DICE_DURATIONS))
      setRolling(false)
      setStep(2)
    }, 650)
  }

  return (
    <motion.div variants={overlay} initial="hidden" animate="show" exit="hidden"
      style={{ position: 'absolute', inset: 0, zIndex: 120, display: 'flex', flexDirection: 'column', background: 'radial-gradient(700px 400px at 80% -10%, #eef0ff 0%, transparent 60%), linear-gradient(180deg,#f7f8ff,#eef2ff)' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '22px 20px 6px' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={back} className="ghost" style={{ padding: 11, borderRadius: 14 }}><IconBack style={{ width: 20, height: 20 }} /></motion.button>
        <div style={{ flex: 1 }}>
          <div className="eyebrow">{t('flow.new')}</div>
          <div className="h2">{[t('flow.step.cat'), t('flow.step.name'), t('flow.step.dur')][step]}</div>
        </div>
      </div>

      {/* step dots */}
      <div style={{ display: 'flex', gap: 7, padding: '4px 20px 14px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 5, borderRadius: 999, flex: 1, background: 'var(--accent-soft)', overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius: 999 }} initial={false} animate={{ width: i <= step ? '100%' : '0%' }} transition={{ type: 'spring', stiffness: 200, damping: 26 }} />
          </div>
        ))}
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        <div style={{ padding: '6px 20px 40px' }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="cat" variants={stepV} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
                {/* dice */}
                <motion.button whileTap={{ scale: 0.96 }} onClick={rollDice} disabled={rolling} className="card" style={{ width: '100%', padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg,#faf5ff,#eef2ff)' }}>
                  <motion.div animate={rolling ? { rotate: [0, 360, 720], scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.65 }} style={{ fontSize: 30, width: 40, height: 40, display: 'grid', placeItems: 'center' }}>
                    {diceImg ? <img src={diceImg} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} /> : '🎲'}
                  </motion.div>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>{t('flow.dice')}</div>
                    <div className="sub" style={{ fontSize: 12 }}>{t('dice.title')}</div>
                  </div>
                  <IconArrow style={{ width: 18, height: 18, color: 'var(--muted)' }} />
                </motion.button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {CATEGORIES.map((c, i) => {
                    const Icon = catIcon(c.id)
                    const on = cat === c.id
                    return (
                      <motion.button key={c.id} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setCat(c.id); setTimeout(() => setStep(1), 180) }} className="card"
                        style={{ padding: 18, textAlign: 'left', border: on ? `2px solid ${c.color}` : '2px solid transparent', minHeight: 132, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: -18, top: -18, width: 78, height: 78, borderRadius: '50%', background: c.soft }} />
                        <div style={{ width: 46, height: 46, borderRadius: 15, display: 'grid', placeItems: 'center', color: '#fff', background: `linear-gradient(135deg,${c.grad[0]},${c.grad[1]})`, position: 'relative' }}><Icon style={{ width: 24, height: 24 }} /></div>
                        <div style={{ position: 'relative' }}>
                          <div style={{ fontWeight: 800, fontSize: 15.5 }}>{t('cat.' + c.id)}</div>
                          <div className="sub" style={{ fontSize: 11.5, marginTop: 2 }}>{t('catDesc.' + c.id)}</div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="name" variants={stepV} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
                {catObj && <div className="pill" style={{ background: catObj.soft, color: catObj.color, marginBottom: 16 }}>{t('cat.' + catObj.id)}</div>}
                <div className="fieldLabel">{t('flow.nameQ')}</div>
                <input className="field" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t('flow.namePh')} onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)} maxLength={60} />
                {history.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div className="sub" style={{ fontWeight: 700, marginBottom: 8 }}>{t('flow.recent')}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {history.slice(0, 8).map((h) => (
                        <motion.button key={h} whileTap={{ scale: 0.94 }} onClick={() => setName(h)} className="pill" style={{ background: 'var(--card)', color: 'var(--ink2)', boxShadow: 'var(--shadow-sm)' }}>{h}</motion.button>
                      ))}
                    </div>
                  </div>
                )}
                <motion.button whileTap={{ scale: 0.97 }} className="cta" style={{ marginTop: 26 }} disabled={!name.trim()} onClick={() => setStep(2)}>{t('common.next')} <IconArrow style={{ width: 20, height: 20 }} /></motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="dur" variants={stepV} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
                {catObj && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                    <div className="pill" style={{ background: catObj.soft, color: catObj.color }}>{t('cat.' + catObj.id)}</div>
                    {name && <div className="pill" style={{ background: 'var(--card)', color: 'var(--ink2)', boxShadow: 'var(--shadow-sm)', maxWidth: 200, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{name}</div>}
                  </div>
                )}
                <div style={{ textAlign: 'center', margin: '14px 0 8px' }}>
                  <motion.div key={mins} initial={{ scale: 0.8, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} style={{ fontSize: 68, fontWeight: 800, letterSpacing: -2, lineHeight: 1, background: 'linear-gradient(135deg,var(--accent),var(--accent3))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{mins}</motion.div>
                  <div className="sub" style={{ fontWeight: 700 }}>{t('common.min')}</div>
                  <div className="pill" style={{ marginTop: 12, ...(mins >= 25 ? { background: 'rgba(52,211,153,0.16)', color: '#059669' } : { background: 'rgba(245,158,11,0.14)', color: '#b45309' }) }}>{mins >= 25 ? t('flow.bonusOn') : t('flow.bonusOff')}</div>
                </div>
                <input type="range" min={5} max={120} step={5} value={mins} onChange={(e) => setMins(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)', margin: '16px 0' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {DURATION_PRESETS.map((d) => (
                    <motion.button key={d} whileTap={{ scale: 0.93 }} onClick={() => setMins(d)} className="pill" style={mins === d ? { background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff' } : { background: 'var(--card)', color: 'var(--ink2)', boxShadow: 'var(--shadow-sm)' }}>{d} {t('common.min')}</motion.button>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="cta" style={{ marginTop: 30 }} onClick={go}><IconPlay style={{ width: 20, height: 20 }} /> {t('flow.startNow')}</motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
