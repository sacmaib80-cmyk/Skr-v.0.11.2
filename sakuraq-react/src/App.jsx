import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './store/useStore.js'
import { STORE_ITEMS } from './lib/constants.js'
import BottomNav from './components/BottomNav.jsx'
import SakuraPetals from './components/SakuraPetals.jsx'
import { ToastHost } from './components/Toast.jsx'
import Home from './screens/Home.jsx'
import Today from './screens/Today.jsx'
import History from './screens/History.jsx'
import Store from './screens/Store.jsx'
import QuestFlow from './screens/QuestFlow.jsx'
import Run from './screens/Run.jsx'
import Report from './screens/Report.jsx'
import Menu from './screens/Menu.jsx'
import Schedule from './screens/Schedule.jsx'
import Celebration from './components/Celebration.jsx'

const PAGES = { home: Home, today: Today, history: History, store: Store }
const ORDER = ['home', 'today', 'history', 'store']

const pageVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0, scale: 0.98 }),
}

export default function App() {
  const [page, setPage] = useState('home')
  const [dir, setDir] = useState(1)
  const [showFlow, setShowFlow] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [celebration, setCelebration] = useState(null)

  const status = useStore((s) => s.session.status)
  const equipped = useStore((s) => s.wallet.equipped)
  const gateEvaluate = useStore((s) => s.gateEvaluate)

  // apply equipped accent theme
  useEffect(() => {
    const root = document.documentElement
    const accentItem = STORE_ITEMS.find((i) => i.id === equipped.accent)
    if (accentItem?.accent) {
      root.style.setProperty('--accent', accentItem.accent[0])
      root.style.setProperty('--accent2', accentItem.accent[1])
    } else {
      root.style.setProperty('--accent', '#5b6af0')
      root.style.setProperty('--accent2', '#7c7de8')
    }
  }, [equipped.accent])

  // evaluate the morning gate on load + every minute (locks a missed window)
  useEffect(() => {
    gateEvaluate()
    const id = setInterval(gateEvaluate, 60000)
    return () => clearInterval(id)
  }, [gateEvaluate])

  const navigate = (next) => {
    if (next === page) return
    setDir(ORDER.indexOf(next) > ORDER.indexOf(page) ? 1 : -1)
    setPage(next)
  }

  const Screen = PAGES[page]
  const runActive = status === 'running' || status === 'paused'
  const reporting = status === 'reporting'
  const overlayActive = runActive || reporting || showFlow || showMenu || showSchedule

  return (
    <div className="shell">
      <SakuraPetals />
      <ToastHost />

      <div className="scroll">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={page} custom={dir} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 320, damping: 32 }}>
            <Screen onNavigate={navigate} onStartQuest={() => setShowFlow(true)} onOpenMenu={() => setShowMenu(true)} />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!overlayActive && (
          <motion.div initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
            <BottomNav page={page} onNavigate={navigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-screen flows ── */}
      <AnimatePresence>
        {showFlow && !runActive && !reporting && <QuestFlow key="flow" onClose={() => setShowFlow(false)} onStarted={() => setShowFlow(false)} />}
      </AnimatePresence>

      <AnimatePresence>{runActive && <Run key="run" />}</AnimatePresence>

      <AnimatePresence>
        {reporting && <Report key="report" onDiscard={() => { setShowFlow(false); navigate('home') }} onSubmitted={(r) => { setShowFlow(false); setCelebration(r) }} />}
      </AnimatePresence>

      <AnimatePresence>
        {showMenu && <Menu key="menu" onClose={() => setShowMenu(false)} onOpenSchedule={() => setShowSchedule(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showSchedule && <Schedule key="sched" onClose={() => setShowSchedule(false)} onStarted={() => { setShowSchedule(false); setShowMenu(false) }} />}
      </AnimatePresence>

      {/* Celebration lives at App level so it survives the session reset */}
      <AnimatePresence>
        {celebration && (
          <Celebration key="celebrate" score={celebration.questScore} bonus={celebration.bonus} gateBonus={celebration.gateBonus || 0}
            onClose={() => { setCelebration(null); navigate('today') }} />
        )}
      </AnimatePresence>
    </div>
  )
}
