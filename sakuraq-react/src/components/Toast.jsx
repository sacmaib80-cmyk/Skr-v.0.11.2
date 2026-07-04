import { create } from 'zustand'
import { AnimatePresence, motion } from 'framer-motion'

const useToastStore = create((set) => ({
  toasts: [],
  push: (msg, kind = 'info') => {
    const id = Date.now() + Math.random()
    set((s) => ({ toasts: [...s.toasts, { id, msg, kind }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2400)
  },
}))

export const toast = (msg, kind) => useToastStore.getState().push(msg, kind)

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(14px + env(safe-area-inset-top,0px))',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: 200,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: -24, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="glass"
            style={{
              padding: '11px 18px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              color: t.kind === 'bad' ? '#be123c' : t.kind === 'good' ? '#047857' : 'var(--ink)',
              boxShadow: 'var(--shadow)',
            }}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
