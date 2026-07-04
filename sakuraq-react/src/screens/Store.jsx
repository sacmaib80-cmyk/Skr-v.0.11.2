import { motion } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { useT } from '../lib/useT.js'
import { STORE_ITEMS } from '../lib/constants.js'
import { IconCoin, IconCheck } from '../components/Icons.jsx'
import CountUp from '../components/CountUp.jsx'
import { toast } from '../components/Toast.jsx'

const SLOTS = ['startBtn', 'dice', 'accent']

export default function Store() {
  const t = useT()
  const spendable = useStore((s) => s.spendable())
  const wallet = useStore((s) => s.wallet)
  const buyItem = useStore((s) => s.buyItem)
  const equipItem = useStore((s) => s.equipItem)

  const handle = (item) => {
    const owned = wallet.owned.includes(item.id)
    const name = t(item.nameKey)
    if (owned) {
      const willEquip = wallet.equipped[item.slot] !== item.id
      equipItem(item)
      toast(willEquip ? t('store.equippedMsg', { name }) : t('store.unequippedMsg'), 'good')
      return
    }
    const res = buyItem(item)
    if (res.ok) toast(t('store.bought', { name }), 'good')
    else if (res.reason === 'poor') toast(t('store.notEnough'), 'bad')
  }

  return (
    <div className="page-pad">
      <div className="eyebrow">{t('store.eyebrow')}</div>
      <div className="h1" style={{ marginTop: 2 }}>{t('store.title')}</div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card" style={{ padding: 20, marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-soft),transparent)' }} />
        <div style={{ width: 52, height: 52, borderRadius: 16, display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', boxShadow: 'var(--shadow-accent)' }}><IconCoin style={{ width: 28, height: 28 }} /></div>
        <div style={{ position: 'relative' }}>
          <div className="sub" style={{ fontWeight: 700 }}>{t('store.wallet')}</div>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}><CountUp value={spendable} /></div>
        </div>
      </motion.div>

      <div className="sub" style={{ marginTop: 10, fontSize: 12, lineHeight: 1.5 }}>{t('store.walletNote')}</div>

      {SLOTS.map((slot) => {
        const items = STORE_ITEMS.filter((i) => i.slot === slot)
        return (
          <div key={slot} style={{ marginTop: 22 }}>
            <div className="h2" style={{ marginBottom: 12 }}>{t('store.slot.' + slot)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {items.map((item, i) => {
                const owned = wallet.owned.includes(item.id)
                const on = wallet.equipped[item.slot] === item.id
                const afford = spendable >= item.price
                return (
                  <motion.button key={item.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.96 }} onClick={() => handle(item)} className="card"
                    style={{ padding: 14, textAlign: 'left', border: on ? '2px solid var(--accent)' : '2px solid transparent', position: 'relative' }}>
                    {on && <div style={{ position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', zIndex: 2 }}><IconCheck style={{ width: 15, height: 15 }} /></div>}
                    {item.img ? (
                      <div style={{ height: 66, borderRadius: 14, background: 'linear-gradient(135deg,#f3f0ff,#eef2ff)', display: 'grid', placeItems: 'center' }}>
                        <img src={item.img} alt="" style={{ height: 58, objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.14))' }} />
                      </div>
                    ) : (
                      <div style={{ height: 66, borderRadius: 14, background: item.swatch, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.12)' }} />
                    )}
                    <div style={{ fontWeight: 800, fontSize: 14, marginTop: 11 }}>{t(item.nameKey)}</div>
                    <div style={{ marginTop: 6 }}>
                      {owned ? (
                        <span className="pill" style={{ background: on ? 'var(--accent-soft)' : 'rgba(138,144,173,0.14)', color: on ? 'var(--accent)' : 'var(--muted)', fontSize: 11.5 }}>{on ? t('store.equipped') : t('store.tapEquip')}</span>
                      ) : item.price === 0 ? (
                        <span className="pill" style={{ fontSize: 11.5 }}>{t('store.free')}</span>
                      ) : (
                        <span className="pill" style={{ background: afford ? 'var(--accent-soft)' : 'rgba(244,63,94,0.12)', color: afford ? 'var(--accent)' : '#e11d48', fontSize: 11.5 }}><IconCoin style={{ width: 13, height: 13 }} /> {item.price}</span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
