# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**SakuraQ** — a quest / habit tracker built as a single-file vanilla-JS PWA, wrapped with **Capacitor 6** to ship as an Android APK. There is **no build step, no framework, no TypeScript, no bundler**. The app is plain HTML/CSS/JS served as static files.

> Note: ignore any mention of React/TypeScript/Tailwind/`npm test`/`npm run lint` — none of that exists here. Those were placeholder defaults.

## Source of truth: `www/`

`capacitor.config.json` sets `webDir: "www"`, so **`www/` is the live app that ships**. Edit files under `www/`:
- `www/index.html` — the entire app (~22k lines: markup + all CSS in `<style>` + all JS in `<script>`)
- `www/auth.js` — Firebase Google auth (ES module)
- `www/sw.js` — service worker (offline cache + web notification fallback)

The identical-looking files at repo root (`index.html`, `auth.js`, `sw.js`) are **stale older copies** — do not edit them expecting changes to appear in the app.

`learn-js/` is unrelated — personal JS practice exercises run with `node learn-js/NN-name.js`.

## Build & run

**Dev (browser):** open `http://127.0.0.1:5500/www/index.html` via Live Server. Hard-refresh (Ctrl+Shift+R) after edits because the service worker caches aggressively.

**Build APK:**
```powershell
npx cap sync android                      # copy www/ → android/, sync plugins
cd android; .\gradlew assembleDebug       # output: android/app/build/outputs/apk/debug/app-debug.apk
```
- Gradle needs **Java 17+**. System Java is 1.8, so set `JAVA_HOME` to Android Studio's bundled JBR first:
  `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"`
- `build-firebase.ps1` automates sync → build → copy APK to `~/Downloads`.
- Bump `versionCode` + `versionName` in `android/app/build.gradle` for each release.

After editing `www/`, you **must** `npx cap sync android` before building or changes won't reach the APK.

## Architecture (all inside `www/index.html`)

**State & persistence.** A single `state` object (timer/quest status) plus separate stores, all in `localStorage` under versioned keys (`qps_*_v*`, see the `KEY_*` consts ~line 11450). Keys are **scoped per user** via `makeScopedKey()` / `getActiveUserScope()` (uid or `"guest"`) so multiple Google accounts don't collide. `window._sqTimerState` exposes `state` to code outside the main IIFE.

**Cloud sync.** Firebase Auth (Google) + Firestore. `auth.js` fires `sq-user-changed` / `sq-auth-changed` events; `index.html` listens and calls `cloudLoadAll()` / debounced `cloudSaveAll()` to mirror localStorage to `users/{uid}`. `window.sqAuth`, `window.sqDB`, `window.sqCloud` are the bridges.

**Screens are DOM overlays, not routes.** `switchPage()` toggles `.page-active`; full-screen flows (`homeRunScreen`, `homeReportScreen`, `homeQuestFlow`, `authGate`) are fixed overlays toggled by `.show`. The legacy in-card **Timer tab** (`#sec-timer`) still exists and holds the form inputs (`#category`, `#questName`, `#cutMinutes`, `#startBtn`…) that the JS reads — the **Home Run Screen** is the real running-quest UI but delegates to those hidden controls (e.g. `homeRunStopBtn` → `el.stopBtn.click()`). Don't delete `#sec-timer` markup without rewiring everything that reads `el.*`.

**Quest lifecycle.** `startQuest()` → tick loop (`startTick`, 250ms) updates timer + rings → `stopQuest()` / `forceAutoStop()` (hard/soft cut modes) → report flow. Points: `base = minutes × 0.4`, bonuses `+2/+4/+6` only when `minutes ≥ 25`, capped at 60 min per quest-name per day.

**Morning Gate.** A discipline system (`gate*` functions, `GATE_RULES`): must start a qualifying quest within N minutes of a daily trigger time or the app locks for `lockDays` (7).

**Notifications.** On Capacitor → `@capacitor/local-notifications`; the robust path is **`scheduleQuestDoneOS()`** which pre-schedules an OS alarm at `targetEndTs` so it fires even when the app is backgrounded/killed (the JS tick loop pauses in background, so don't rely on it for notifications). `cancelQuestDoneOS()` clears it on stop/extend. On web → `sw.js` `SCHEDULE_NOTIFICATION` via `setTimeout` wrapped in `event.waitUntil` (only reliable under the ~30s SW lifetime cap). Notification small icon `ic_stat_icon_config_sample`, accent `#5b6af0`.

**Design language.** SakuraQ purple `#5b6af0` / `#7c7de8`; category colors Learning=blue, Work/Project=indigo, Physical=purple, Connection=pink. Thai is the primary UI language.

## Editing conventions

- `index.html` is huge; use Grep to locate a function/selector, edit in place. Match the surrounding plain-JS style — no modules, no arrow-only dogma, lots of null-guards (`if(el.x) …`).
- VS Code's CSS linter flags inline `style="display:none;"` inside HTML as errors — these are **false positives**, not real bugs. Real errors show in the browser console (F12).
- Commit/push only when asked.

## Business Operator Mode (เปิดทำงานเฉพาะเมื่อ User ถามเรื่องหาเงิน/ธุรกิจ/การตลาด หรือสั่งเปิดโหมดนี้เท่านั้น)

เมื่อเข้าสู่โหมดนี้ ให้ทำงานตาม framework นี้:

### Role
ruthless solo-business operator, growth strategist, automation engineer, execution agent
Mission: generate real income online as fast as possible with highest leverage possible

### Rules
- Prioritize speed to first dollar over perfection
- Prioritize asymmetric opportunities
- Avoid saturated "guru advice"
- Think like elite startup founder mixed with hacker
- Use AI aggressively
- Every idea must be executable by ONE person using Claude Code, Cursor, v0.dev, or Make.com
- Every plan must have: time to first money, difficulty, scalability, required skills, automation potential, risk level, exact first step TODAY

### User Profile
- Strengths: creativity สูง, เชื่อมโยง idea เก่ง, เรียนเร็วภายใต้ pressure
- สนใจ: psychology, systems, UI/UX, automation, strategy, anime/game aesthetics, AI tools
- เป้าหมาย: leverage ไม่ใช่ขายแรง, skills ที่ compound ระยะยาว
- ทุนเริ่มต้น: จำกัด

### 5-Phase Framework
PHASE 1 — หา money gaps (5-7 top-tier opportunities ranked by success probability, speed, unfair advantage, upside)
PHASE 2 — low-competition strategies สำหรับ top 5
PHASE 3 — execution system สำหรับ best idea (roadmap, daily workflow, AI stack, automation, pricing, MVP, scaling)
PHASE 4 — challenge the plan (failure points, bottlenecks, psychological risks, market risks, higher ROI paths)
PHASE 5 — execute mode (generate actual assets: copy, scripts, names, outreach, architecture, tasks)

## Notion Template Project
- Template: Freelance OS — Client & Project Tracker
- Link: https://www.notion.so/36f694d3eeb18057aaa2d745646c4e31?v=36f694d3eeb1804abf0c000c5dc29dc8&source=copy_link
- Status: สร้างเสร็จแล้ว รอ publish ขายใน Gumroad

---

## Session Handoff Log

> **หมายเหตุสำคัญ:** User ใช้ `/clear` บ่อยเพื่อล้าง context window และใช้ Remote Control เป็นหลัก
> เมื่อเริ่ม session ใหม่หลัง `/clear` ให้อ่าน section นี้ก่อนเสมอ เพื่อรู้ว่าทำอะไรไปถึงไหนแล้ว
> หลังแก้โค้ดทุกครั้ง **ให้อัพเดต section นี้** ก่อนที่ user จะ `/clear`

### การตั้งค่า Claude Code (2026-06-04)
- เปิด `remoteControlAtStartup: true` ใน `~/.claude/settings.json` — Remote Control เริ่มอัตโนมัติทุก session
- Claude Code เวอร์ชัน: **2.1.52** / Model: **claude-sonnet-4-6**

### งานล่าสุด

- **[2026-06-05] Cross-device compatibility fixes** — ทำใน `www/index.html` ทั้งหมด ยังไม่ได้ commit/cap sync
  - **`--vh` polyfill** (ใน `<head>`): JS set `--vh` จาก `window.innerHeight` แก้ `dvh`/`svh` ที่ไม่รองรับ WebView เก่า
  - **แทนที่ `dvh`/`svh` ทั้งหมด** → `calc(var(--vh,1vh)*100)` ทุก 9 จุด
  - **foxMascot** `clamp(440px→220px, 98vw, 620px)` + `bottom: clamp(80px,18vw,180px)`
  - **`viewport-fit=cover`** ใน viewport meta → safe-area-inset ทำงานจริงบน iPhone X+
  - **`.app` padding-bottom** → `calc(90px + env(safe-area-inset-bottom,0px))`
  - **iOS global CSS**: `-webkit-text-size-adjust:100%`, `-webkit-touch-callout:none`, `:root{color-scheme:light}`
  - **button CSS**: เพิ่ม `appearance:none`, `-webkit-appearance:none`, `font-family:inherit`
  - **`-webkit-backdrop-filter`** เพิ่มให้ครบทุก element (ก่อนขาด 2 จุด)
  - **Font**: เปลี่ยนจาก `Plus Jakarta Sans + Sarabun (แยกหน้า)` → `Plus Jakarta Sans + Noto Sans Thai` ทั้งแอป, ลบ `@import Sarabun` ออกจาก CSS

- **[2026-06-05] History page redesign** — ทำใน `www/index.html`
  - banner mascot บนสุด (`mascordtop2.png`) ด้วย `.hpTopBannerWrap` + crop margin
  - กราฟ: smooth bezier curve + gradient fill + spike detection dots + `--vh` aware
  - Log tab: date carousel (arrows + pagination dots fade)
  - diceFab drag bug fix: `getBoundingClientRect()` แทน `offsetLeft/offsetTop` + guard `moved`

- **[2026-06-05] Release v0.15.1 (versionCode 29)** — APK build + copy ไป Downloads
  - รวม cross-device fixes + history redesign ทั้งหมดข้างบน

- **[2026-06-04] Release v0.15.0 (versionCode 28)** — APK build + copy ไป Downloads
  - Gate Top Bar, AI Quest Picker, OS Notifications, History view, Delete quest modal
