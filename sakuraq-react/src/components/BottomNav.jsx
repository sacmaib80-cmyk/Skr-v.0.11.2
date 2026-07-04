import { motion } from 'framer-motion'
import { useT } from '../lib/useT.js'
import { IconHome, IconToday, IconHistory, IconStore } from './Icons.jsx'

const TABS = [
  { id: 'home', key: 'nav.home', Icon: IconHome },
  { id: 'today', key: 'nav.today', Icon: IconToday },
  { id: 'history', key: 'nav.history', Icon: IconHistory },
  { id: 'store', key: 'nav.store', Icon: IconStore },
]

export default function BottomNav({ page, onNavigate }) {
  const t = useT()
  return (
    <nav className="nav">
      {TABS.map(({ id, key, Icon }) => {
        const on = page === id
        return (
          <button key={id} className={`navBtn ${on ? 'on' : ''}`} onClick={() => onNavigate(id)} aria-label={t(key)}>
            {on && <motion.span layoutId="navDot" className="navDot" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <motion.span animate={{ scale: on ? 1.12 : 1, y: on ? -1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }}><Icon /></motion.span>
            <span className="navLabel">{t(key)}</span>
          </button>
        )
      })}
    </nav>
  )
}
