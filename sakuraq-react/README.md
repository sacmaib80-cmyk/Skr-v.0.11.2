# SakuraQ — React edition

A React rebuild of SakuraQ (quest / habit tracker). Same core mechanics as the
vanilla PWA, with a soft lavender-pastel identity and much bolder motion.

**Scope:** core systems only — no Firebase auth, no notifications, no Capacitor/APK.
Everything runs client-side and persists to `localStorage`.

## Stack
- **Vite + React 18**
- **Framer Motion** — page transitions, spring physics, celebrations
- **Zustand** (+ persist middleware) — state & localStorage

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## What's implemented
- **Home** — greeting, animated daily progress (score / 100), level, streak, mascot, start CTA
- **Quest flow** — category → name (with history suggestions) → duration
- **Run** — live countdown ring (category-tinted), pause/resume, +5/+10 min, stop
- **Report** — editable minutes, live projected score, reflection fields for +2/+4/+6 bonuses
- **Celebration** — confetti + counted score reward moment
- **Today** — quest list, per-category breakdown, delete
- **History** — 14-day animated bar chart, stats, tap a day to inspect
- **Store** — spend *earned* points on cosmetics (start-button colours, accent themes); level/streak never decrease

## Scoring (faithful port)
- base = `minutes × 0.4`, capped at **60 base-min per quest-name per day**
- bonus (only when `minutes ≥ 25`): **+2** reflection note, **+4** + why/from/to, **+6** + proof
- day goal = **100** · level = `⌊lifetime / 100⌋ + 1`
- wallet spendable = `lifetime earned − spent`

## Layout
```
src/
  lib/         constants (categories, rules, store), date + scoring engines
  store/       zustand store (persistence + all actions)
  components/  SakuraPetals, ProgressRing, Mascot, BottomNav, CountUp, Celebration, Toast, Icons
  screens/     Home, QuestFlow, Run, Report, Today, History, Store
  App.jsx      routing + full-screen flow orchestration
```
