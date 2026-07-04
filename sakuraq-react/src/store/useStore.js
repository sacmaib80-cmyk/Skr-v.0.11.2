import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { localDateKey, addDays, round1, daysBetween } from '../lib/date.js'
import { scoreQuest, dayEffective, lifetimePoints, computeStreak, breakPenaltyFor } from '../lib/scoring.js'
import { RULES, GATE_RULES, BREAK_RULES } from '../lib/constants.js'

const emptySession = () => ({
  status: 'idle', // idle | running | paused | reporting
  category: null,
  questName: '',
  plannedMin: 25,
  targetEndTs: 0,
  remainingMs: 0,
  elapsedMs: 0,
  startedAt: 0,
})

function ensureDay(days, key) {
  if (!days[key]) days[key] = { quests: [], penalties: [], gateBonus: 0 }
  if (!Array.isArray(days[key].quests)) days[key].quests = []
  if (!Array.isArray(days[key].penalties)) days[key].penalties = []
  return days[key]
}

// window end (ms) for the morning gate on a given Date
function gateWindow(time) {
  const [hh, mm] = String(time || '08:00').split(':').map(Number)
  const trigger = new Date()
  trigger.setHours(hh || 0, mm || 0, 0, 0)
  return { trigger: trigger.getTime(), winEnd: trigger.getTime() + GATE_RULES.limitMin * 60000 }
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ── persisted data ──
      days: {},
      profile: { name: 'เพื่อน' },
      wallet: { spent: 0, owned: ['btn-indigo'], equipped: { startBtn: 'btn-indigo', dice: null, accent: null } },
      questNameHistory: [],
      lang: 'th',
      settings: {
        gate: { enabled: false, time: '08:00' },
        break: { enabled: false, lastToggleTs: 0 },
      },
      gate: { passedDate: '', missedDate: '', lockUntil: '', startedInWindow: '' },
      breakState: { active: false, breakEndTs: 0, graceEndTs: 0, questMin: 0, penalized: false },
      schedule: [],
      session: emptySession(),

      // ── selectors ──
      today: () => localDateKey(),
      dayEffectiveToday: () => dayEffective(get().days[localDateKey()]),
      lifetime: () => lifetimePoints(get().days),
      spendable: () => round1(Math.max(0, lifetimePoints(get().days) - (get().wallet.spent || 0))),
      streak: () => computeStreak(get().days, localDateKey(), addDays),

      // ── language ──
      setLang: (lang) => set({ lang }),

      // ── profile ──
      setName: (name) => {
        const clean = String(name || '').trim().slice(0, 18)
        if (!clean) return
        set((s) => ({ profile: { ...s.profile, name: clean } }))
      },

      // ══════════════ MORNING GATE ══════════════
      setGateConfig: (patch) =>
        set((s) => ({ settings: { ...s.settings, gate: { ...s.settings.gate, ...patch } } })),

      // pure status for the UI
      gateStatus: () => {
        const { enabled, time } = get().settings.gate
        if (!enabled) return { state: 'off' }
        const today = localDateKey()
        const g = get().gate
        if (g.lockUntil && daysBetween(today, g.lockUntil) > 0)
          return { state: 'locked', daysLeft: daysBetween(today, g.lockUntil) }
        if (g.passedDate === today) return { state: 'passed' }
        const { trigger, winEnd } = gateWindow(time)
        const now = Date.now()
        if (now < trigger) return { state: 'waiting', trigger }
        if (now <= winEnd) return { state: 'armed', msLeft: winEnd - now }
        return { state: 'missed' }
      },

      // commit a lock if the window was missed (called on load + interval)
      gateEvaluate: () => {
        const { enabled, time } = get().settings.gate
        if (!enabled) return
        const today = localDateKey()
        const g = get().gate
        if (g.lockUntil && daysBetween(today, g.lockUntil) > 0) return // already locked
        if (g.passedDate === today) return
        if (g.missedDate === today) return
        const { winEnd } = gateWindow(time)
        if (Date.now() > winEnd) {
          set({ gate: { ...g, missedDate: today, lockUntil: addDays(today, GATE_RULES.lockDays) } })
        }
      },

      gateUnlock: () =>
        set((s) => ({ gate: { ...s.gate, lockUntil: '', missedDate: '' } })),

      isGateLocked: () => {
        const st = get().gateStatus()
        return st.state === 'locked'
      },

      // ══════════════ BREAK TIME ══════════════
      setBreakEnabled: (enabled) =>
        set((s) => ({ settings: { ...s.settings, break: { enabled, lastToggleTs: Date.now() } } })),

      breakToggleReadyIn: () => {
        const last = get().settings.break.lastToggleTs || 0
        const left = BREAK_RULES.toggleCooldownMs - (Date.now() - last)
        return Math.max(0, left)
      },

      triggerBreak: (questMin) => {
        if (!get().settings.break.enabled) return
        if (questMin < 1) return
        const now = Date.now()
        const restMin = BREAK_RULES.freeMins + Math.floor(questMin / 2)
        const breakEndTs = now + restMin * 60000
        set({ breakState: { active: true, breakEndTs, graceEndTs: breakEndTs + BREAK_RULES.graceMs, questMin, penalized: false } })
      },

      clearBreak: () => set({ breakState: { active: false, breakEndTs: 0, graceEndTs: 0, questMin: 0, penalized: false } }),

      // penalty for how far past grace you are right now
      breakOverPenalty: () => {
        const b = get().breakState
        if (!b.active) return 0
        const overMin = (Date.now() - b.graceEndTs) / 60000
        return breakPenaltyFor(overMin, BREAK_RULES.tiers)
      },

      // apply a penalty for over-resting (called when starting the next quest)
      applyBreakPenaltyIfAny: () => {
        const b = get().breakState
        if (!b.active || b.penalized) return 0
        const overMin = (Date.now() - b.graceEndTs) / 60000
        const pts = breakPenaltyFor(overMin, BREAK_RULES.tiers)
        if (pts > 0) {
          const days = structuredClone(get().days)
          const day = ensureDay(days, localDateKey())
          day.penalties.push({ ts: Date.now(), pts, overMin: Math.floor(overMin) })
          set({ days })
        }
        return pts
      },

      // ══════════════ SCHEDULE ══════════════
      addPlan: ({ category, questName, plannedMin }) =>
        set((s) => ({
          schedule: [...s.schedule, { id: Date.now() + Math.random(), category, questName: String(questName || '').trim(), plannedMin }],
        })),
      removePlan: (id) => set((s) => ({ schedule: s.schedule.filter((p) => p.id !== id) })),

      // ══════════════ QUEST LIFECYCLE ══════════════
      startQuest: ({ category, questName, plannedMin, fromPlanId }) => {
        if (get().isGateLocked()) return { ok: false, reason: 'locked' }
        // over-rest penalty when returning from a break
        const penalty = get().applyBreakPenaltyIfAny()
        get().clearBreak()
        if (fromPlanId != null) get().removePlan(fromPlanId)

        const min = Math.max(1, Math.round(plannedMin))
        const now = Date.now()
        // record that a quest was started inside the gate window (for pass resolution)
        const st = get().gateStatus()
        if (st.state === 'armed' || st.state === 'waiting') {
          set((s) => ({ gate: { ...s.gate, startedInWindow: localDateKey() } }))
        }
        set({
          session: {
            status: 'running',
            category,
            questName: String(questName || '').trim(),
            plannedMin: min,
            targetEndTs: now + min * 60000,
            remainingMs: min * 60000,
            elapsedMs: 0,
            startedAt: now,
          },
        })
        return { ok: true, penalty }
      },

      pauseQuest: () => {
        const s = get().session
        if (s.status !== 'running') return
        set({ session: { ...s, status: 'paused', remainingMs: Math.max(0, s.targetEndTs - Date.now()) } })
      },
      resumeQuest: () => {
        const s = get().session
        if (s.status !== 'paused') return
        set({ session: { ...s, status: 'running', targetEndTs: Date.now() + s.remainingMs } })
      },
      extendQuest: (mins) => {
        const s = get().session
        if (s.status === 'running') set({ session: { ...s, targetEndTs: s.targetEndTs + mins * 60000, plannedMin: s.plannedMin + mins } })
        else if (s.status === 'paused') set({ session: { ...s, remainingMs: s.remainingMs + mins * 60000, plannedMin: s.plannedMin + mins } })
      },
      stopQuest: () => {
        const s = get().session
        if (s.status !== 'running' && s.status !== 'paused') return
        const now = Date.now()
        const elapsedMs = s.status === 'running' ? Math.max(0, now - s.startedAt) : Math.max(0, s.plannedMin * 60000 - s.remainingMs)
        const cappedMs = Math.min(elapsedMs, RULES.baseCapPerQuestNamePerDay * 60000)
        set({ session: { ...s, status: 'reporting', elapsedMs: cappedMs } })
      },
      cancelSession: () => set({ session: emptySession() }),

      submitReport: ({ minutes, note, why, from, to, proof }) => {
        const s = get().session
        const dateKey = localDateKey()
        const qn = String(s.questName || '').trim() || 'เควส'
        const days = structuredClone(get().days)
        const day = ensureDay(days, dateKey)
        const { baseMinutesUsed, baseScore, bonus, questScore } = scoreQuest({
          day, questName: qn, minutes, bonusInputs: { note, why, from, to, proof },
        })
        day.quests.push({
          ts: Date.now(), dateKey, category: s.category, questName: qn,
          minutesSpent: Math.max(0, Math.round(minutes)), baseMinutesUsed, baseScore, bonus, questScore,
          note: String(note || '').trim(), why: String(why || '').trim(), from: String(from || '').trim(), to: String(to || '').trim(),
        })

        // ── resolve Morning Gate pass (+bonus) ──
        let gatePassed = false
        const gcfg = get().settings.gate
        if (gcfg.enabled) {
          const g = get().gate
          const locked = g.lockUntil && daysBetween(dateKey, g.lockUntil) > 0
          const { winEnd } = gateWindow(gcfg.time)
          if (!locked && g.passedDate !== dateKey && Date.now() <= winEnd && baseMinutesUsed >= GATE_RULES.qualifyMin) {
            day.gateBonus = (day.gateBonus || 0) + GATE_RULES.bonusPoints
            gatePassed = true
          }
        }

        const history = Array.from(new Set([qn, ...get().questNameHistory])).slice(0, 30)
        const patch = { days, session: emptySession(), questNameHistory: history }
        if (gatePassed) patch.gate = { ...get().gate, passedDate: dateKey }
        set(patch)

        // start the forced break (if enabled)
        get().triggerBreak(Math.max(0, Math.round(minutes)))

        return { questScore, baseScore, bonus, baseMinutesUsed, gatePassed, gateBonus: gatePassed ? GATE_RULES.bonusPoints : 0 }
      },

      deleteQuest: (dateKey, ts) => {
        const days = structuredClone(get().days)
        const day = days[dateKey]
        if (!day) return
        day.quests = (day.quests || []).filter((q) => q.ts !== ts)
        set({ days })
      },
      resetToday: () => {
        const days = structuredClone(get().days)
        days[localDateKey()] = { quests: [], penalties: [], gateBonus: 0 }
        set({ days })
      },

      // ══════════════ STORE / WALLET ══════════════
      buyItem: (item) => {
        const spendable = get().spendable()
        const w = get().wallet
        if (w.owned.includes(item.id)) return { ok: false, reason: 'owned' }
        if (spendable < item.price) return { ok: false, reason: 'poor' }
        set({ wallet: { ...w, spent: round1((w.spent || 0) + item.price), owned: [...w.owned, item.id] } })
        return { ok: true }
      },
      equipItem: (item) => {
        const w = get().wallet
        if (!w.owned.includes(item.id)) return
        const equipped = { ...w.equipped }
        const defOff = item.slot === 'startBtn' ? 'btn-indigo' : null
        equipped[item.slot] = equipped[item.slot] === item.id ? defOff : item.id
        set({ wallet: { ...w, equipped } })
      },
    }),
    {
      name: 'sakuraq-react-v1',
      partialize: (s) => ({
        days: s.days, profile: s.profile, wallet: s.wallet, questNameHistory: s.questNameHistory,
        lang: s.lang, settings: s.settings, gate: s.gate, breakState: s.breakState, schedule: s.schedule, session: s.session,
      }),
      migrate: (persisted) => {
        // ensure new fields exist for stores saved before these features
        if (persisted && !persisted.wallet?.equipped?.dice) {
          persisted.wallet = persisted.wallet || { spent: 0, owned: ['btn-indigo'], equipped: {} }
          persisted.wallet.equipped = { startBtn: 'btn-indigo', dice: null, accent: null, ...(persisted.wallet.equipped || {}) }
        }
        return persisted
      },
      version: 2,
    }
  )
)
