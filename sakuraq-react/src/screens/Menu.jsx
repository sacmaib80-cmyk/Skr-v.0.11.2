import { motion } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { useT } from '../lib/useT.js'
import { GATE_RULES, BREAK_RULES } from '../lib/constants.js'
import { IconBack, IconArrow } from '../components/Icons.jsx'
import { toast } from '../components/Toast.jsx'

function Switch({ on, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 52, height: 30, borderRadius: 999, padding: 3, background: on ? 'linear-gradient(135deg,var(--accent),var(--accent2))' : 'var(--line)', opacity: disabled ? 0.5 : 1, transition: 'background .2s', flexShrink: 0 }}>
      <motion.div layout style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', marginLeft: on ? 22 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
    </button>
  )
}

function Row({ children }) {
  return <div className="card" style={{ padding: 16, marginBottom: 12 }}>{children}</div>
}

export default function Menu({ onClose, onOpenSchedule }) {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  const settings = useStore((s) => s.settings)
  const setGateConfig = useStore((s) => s.setGateConfig)
  const setBreakEnabled = useStore((s) => s.setBreakEnabled)
  const breakToggleReadyIn = useStore((s) => s.breakToggleReadyIn)
  const resetToday = useStore((s) => s.resetToday)
  const schedule = useStore((s) => s.schedule)

  const cooldownLeft = breakToggleReadyIn()
  const cooldownMin = Math.ceil(cooldownLeft / 60000)

  const toggleBreak = () => {
    if (cooldownLeft > 0) {
      toast(t('break.cooldown', { n: `${cooldownMin} ${t('common.min')}` }), 'bad')
      return
    }
    setBreakEnabled(!settings.break.enabled)
  }

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{ position: 'absolute', inset: 0, zIndex: 130, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#f7f8ff,#eef2ff)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '22px 20px 10px' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="ghost" style={{ padding: 11, borderRadius: 14 }}>
          <IconBack style={{ width: 20, height: 20 }} />
        </motion.button>
        <div className="h1">{t('menu.title')}</div>
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        <div style={{ padding: '8px 20px 40px' }}>
          {/* language */}
          <Row>
            <div style={{ fontWeight: 800, marginBottom: 12 }}>{t('menu.language')}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[['th', t('menu.langTH')], ['en', t('menu.langEN')]].map(([code, label]) => (
                <motion.button key={code} whileTap={{ scale: 0.96 }} onClick={() => setLang(code)} style={{ flex: 1, padding: '12px', borderRadius: 14, fontWeight: 700, background: lang === code ? 'linear-gradient(135deg,var(--accent),var(--accent2))' : 'var(--card-2)', color: lang === code ? '#fff' : 'var(--ink2)', border: '1.5px solid var(--line)' }}>
                  {label}
                </motion.button>
              ))}
            </div>
          </Row>

          {/* morning gate */}
          <Row>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>🌅 {t('menu.gate')}</div>
                <div className="sub" style={{ fontSize: 12 }}>{t('menu.gateSub')}</div>
              </div>
              <Switch on={settings.gate.enabled} onClick={() => setGateConfig({ enabled: !settings.gate.enabled })} />
            </div>
            {settings.gate.enabled && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ overflow: 'hidden' }}>
                <div style={{ paddingTop: 14 }}>
                  <div className="sub" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>{t('gate.desc', { limit: GATE_RULES.limitMin, days: GATE_RULES.lockDays })}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="fieldLabel" style={{ margin: 0 }}>{t('gate.time')}</span>
                    <input type="time" className="field" style={{ width: 'auto', flex: 1 }} value={settings.gate.time} onChange={(e) => setGateConfig({ time: e.target.value })} />
                  </div>
                </div>
              </motion.div>
            )}
          </Row>

          {/* break time */}
          <Row>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>☕ {t('menu.break')}</div>
                <div className="sub" style={{ fontSize: 12 }}>{t('menu.breakSub')}</div>
              </div>
              <Switch on={settings.break.enabled} onClick={toggleBreak} disabled={cooldownLeft > 0} />
            </div>
            {settings.break.enabled && (
              <div className="sub" style={{ fontSize: 12, lineHeight: 1.5, marginTop: 12 }}>{t('break.desc', { free: BREAK_RULES.freeMins })}</div>
            )}
          </Row>

          {/* schedule */}
          <motion.button whileTap={{ scale: 0.99 }} onClick={onOpenSchedule} className="card" style={{ width: '100%', textAlign: 'left', padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>🎯 {t('menu.schedule')}</div>
              <div className="sub" style={{ fontSize: 12 }}>{t('menu.scheduleSub')}{schedule.length > 0 ? ` · ${schedule.length}` : ''}</div>
            </div>
            <IconArrow style={{ width: 18, height: 18, color: 'var(--muted)' }} />
          </motion.button>

          {/* reset today */}
          <motion.button whileTap={{ scale: 0.99 }} onClick={() => { if (confirm(t('menu.reset') + '?')) { resetToday(); toast(t('menu.resetDone')); onClose() } }} className="card" style={{ width: '100%', textAlign: 'left', padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: 'var(--bad)' }}>🗑️ {t('menu.reset')}</div>
              <div className="sub" style={{ fontSize: 12 }}>{t('menu.resetSub')}</div>
            </div>
          </motion.button>

          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>{t('menu.about')}</div>
        </div>
      </div>
    </motion.div>
  )
}
