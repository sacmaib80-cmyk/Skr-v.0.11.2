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
- **Beware smart/curly quotes (`”` `“` `’`) in pasted markup.** They look like straight quotes but break HTML silently: `class=”x”` makes the class literally `”x”`, so CSS won't match, `getElementById` returns null, and `data-i18n` lookups fail (raw keys render). When a freshly-added block shows *all* of: no styling + JS can't find its element + i18n keys showing raw → it's almost always curly quotes in the markup, **not** a cache/i18n/runtime bug. Check the raw HTML attributes FIRST before theorizing. Scan: `node -e "...test(/[“”‘’]/)..."`.
- **i18n coverage sweeps — อย่าข้ามส่วน markup.** ไฟล์เรียงเป็น `<head><style>` → `<body>` **HTML markup** → `<script>` (i18n engine + `I18N` dict + JS ทั้งหมด). บทเรียน: เคยเขียน sweep หาภาษาไทยที่ยังไม่แปลโดยใช้ `if(i <= dictEndLine) continue` เพื่อข้าม dict — **แต่ markup อยู่ก่อน dict** เลยถูกข้ามทั้งก้อน ทำให้ UI ของฟีเจอร์ใหม่ (เช่น Break Time panel/modal/banner) หลุดการตรวจ. วิธีที่ถูก: sweep **ช่วง markup แยกต่างหาก** (`<body>` → บรรทัดที่ขึ้นต้น main script) แล้วค่อย sweep ช่วง JS code (หลัง dict). และตอนเช็ค "ติด `data-i18n` หรือยัง" ต้องดู**บรรทัด opening tag** ไม่ใช่บรรทัด content — element หลายบรรทัด (เช่น `data-i18n-html` ที่มี `<br>`) จะมี attribute อยู่บน tag เปิด ส่วนข้อความไทยอยู่บรรทัดถัดๆ ไป (false positive ถ้าเช็คแค่บรรทัดเดียว). หลังแก้เสร็จทุกครั้ง verify ด้วย `node -e` 2 อย่าง: (1) syntax check inline `<script>` ผ่าน `new Function()`, (2) key ที่อ้างถึงมีครบทั้ง `th`+`en` (นับ `"key":` = 2).
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

- **[2026-06-16] Dice language fix — built-in pools ตาม currentLang เสมอ, ไม่ปนข้ามภาษา** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **ปัญหา:** ลูกเต๋าเอา "ข้อมูลเสริมที่เราใส่ไว้" (pool `rq.*`) ของอีกภาษามาปนในชื่อเดียวได้ แม้สลับภาษาแล้ว เพราะ `rqPickGenLang()` เลือกภาษาต่อรอบแบบ history-weighted (ภาษาอื่นโผล่ได้สูงสุด 50%)
  - **แก้:** ลบ `rqPickGenLang()` + `_rqRollLang` + `rqDetectLang()` ทิ้ง → `rqLoc(key)` อ่าน `I18N[currentLang]` ตรงๆ เสมอ. built-in pools (workflow/bodypart/cardio/connection/learn*/work*/fallback*) จึงตามภาษาปัจจุบันเสมอ
  - **history ไม่ถูกแตะ (ตามที่ user สั่ง):** เอา `.filter(d => rqDetectLang(d) === …)` ออกจาก `rqBuildLearningQuest`/`rqBuildWorkQuest` → domain จาก history ไหลผ่านได้ทุกภาษา (ปนได้ ไม่เป็นไร). `rqMatchIndex()` ยัง match th+en เพื่อ map ชื่อ history กลับเป็น index คงเดิม
  - **แทนที่ Phase 3** (history-weighted language) ด้วย logic นี้ — เจตนาเปลี่ยนตาม user (built-in = ภาษาเดียว, history = ปนได้)
  - ยังไม่ได้ run node syntax check (ไม่มี node ใน environment นี้) — ตรวจ braces/refs ด้วยตา + grep ยืนยันไม่มี ref ของ symbol ที่ลบหลงเหลือ

- **[2026-06-09] Break Time Feature** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **ฟีเจอร์ใหม่**: ระบบบังคับพักหลังเควส + หักคะแนนถ้าพักนานเกิน
  - **Menu**: ปุ่ม "Break Time" ลำดับ 2 ใน `#topMenu` (หลัง Morning Gate)
  - **Break Panel**: `#breakPanel` (`.dataPanel` pattern) มี info tooltip, mascord.png warning, enable/disable button, 2hr cooldown hint
  - **Confirm Modal**: `#break-enable-confirm-modal` (mascord.png + คำเตือน) ก่อนเปิด
  - **Home Banner**: `#homeBreakBanner` แสดง countdown (green→amber→red) ในหน้า home
  - **Logic**: `triggerBreak(mins)` หลัง `stopQuest()`/`forceAutoStop()` → breakEndTs = now + (10 + floor(mins/2)) นาที, graceEndTs = breakEndTs + 1 นาที
  - **Penalty**: `applyBreakPenalty()` เขียนใน `day.breakPenalties[]` ใน appData (sync cloud); -2/-4/-6 pts ตาม tier; detect ผ่าน tick loop (250ms) + `checkBreakPenaltyOnStart()` ใน `startQuest()`
  - **Score**: `calcEffectiveDayTotal()` = totalQps - sum(penalties) ใช้ใน renderToday/renderTodayPage/renderHomeProgress/renderHomeHud/updateHomeGreeting/getHistorySummary/getHistoryExtraStats/getHistoryTrendData
  - **Today cards**: penalty card (orange/lightRed/darkRed) ใน `#todayList` + tpQuestList
  - **Storage**: `KEY_BREAK_CFG`/`KEY_BREAK_STATE` ใน localStorage scoped (ไม่อยู่ใน appData เหมือน gate bug fix)
  - **Cooldown**: toggle ได้ทุก 2 ชั่วโมง (`BREAK_TOGGLE_COOLDOWN_MS`)
  - **OS Noti**: `scheduleBreakEndOS()`/`cancelBreakEndOS()` schedule notification ตอนพักหมด
  - **i18n**: `break.*`, `noti.break.*` ทั้ง th/en
  - **bug fix #1**: breakTickHandle แยก interval (1s) → banner countdown ไม่แช่แข็ง
  - **bug fix #2**: History page ใช้ `calcEffectiveDayTotal()` ทุกจุด (summary/extra/chart/selectedTotal)
  - **bug fix #3**: `updateHomeGreeting()` ใช้ `calcEffectiveDayTotal()` แทน `calcDayTotal()`
  - **bug fix #4**: `discardReport()` เรียก `clearBreakState(); renderBreakUI()` — break reset ตอน discard
  - **bug fix #6**: `applyBreakPenalty()` ใช้ `localDateKey()` แทน `triggeredAtDateKey` — penalty ไปวันที่หักเงิน ไม่ใช่วันเควส
  - **bug fix #7**: `triggerBreak()` guard `if(questMinutes < 1) return` — เควส 0 นาทีไม่ trigger break
  - **bug ที่ยังไม่แก้ (ค่อยทำทีหลัง)**:
    - **#5**: Banner แสดงแค่หน้า Home ไม่แสดงหน้า Today/History/Schedule
    - **#8**: mascot warning ใน panel แสดงตลอด แม้แค่ดู info ไม่ได้กด enable
    - **#9**: `calcLifetimeQps()` ไม่หัก break penalties — ตัวเลข lifetime สูงเกิน
    - **#10**: streak calculation อาจได้รับผลกระทบจาก penalty ที่ทำให้คะแนนวันนั้นเป็น 0
  - ผ่าน node syntax check (0 errors)

- **[2026-06-06] Morning Gate UI — Color & Glow Redesign** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **สีการ์ด**: `#a52020→#520a0a` → **`#B51D1D→#8E1313`** (สว่าง/สะอาดขึ้น ตาม mockup)
  - **Glow**: ขยาย box-shadow 3 ชั้น (35→50px, 85→110px, 170→220px spread) + opacity เพิ่ม
  - **Ring**: gradient orange→pink (`#FF9CB5→#FF6B7A`), dot gold→pink `#FF9CB5`
  - **MORNING GATE badge**: glass style `rgba(255,255,255,.10)` + border `rgba(255,107,122,.35)`
  - **ตัวเลขวงนาฬิกา**: `36px → 30px`
  - **bug fix**: เพิ่ม `z-index:1` ให้ `.gateCard` ป้องกัน mascot หายเมื่อมี backdrop-filter child; ลบ `backdrop-filter` ออกจาก `.gateTitlePill` (ทำให้ compositing layer พัง)
  - **ยังเหลือ**: user รู้สึก UI น่าจะดีได้มากกว่านี้ → ค่อย polish ครั้งหน้า

- **[2026-06-06] Bilingual i18n — Phase 3 (Random Quest: history-weighted language + coherent per-quest)** — ทำใน `www/index.html` (RQ engine) ยังไม่ได้ commit/cap sync
  - **ปัญหาที่แก้:** เควสสุ่มเคยผสมภาษาในชื่อเดียว (domain ไทยจาก history + action อังกฤษ) เพราะ domain ดึงจาก history ทุกภาษา
  - **`rqPickGenLang()`** (ข้าง `rqLoc`): เลือกภาษา **1 ภาษาต่อ 1 การสุ่ม** นับ history `lookbackDays` วัน → ภาษาปัจจุบันได้ขั้นต่ำ ~50%, ภาษาเก่าโผล่ได้สูงสุด 50% ตามสัดส่วน (`pOther = otherN/total * 0.5`), ไม่มี history → ปัจจุบัน 100%. `rqDetectLang(name)` = มีอักขระไทย→th
  - **`_rqRollLang`** state + แก้ `rqLoc(key)` ให้อ่านภาษานี้ (อ่านจาก `I18N[lang][key]` ตรงๆ ไม่ใช่ `tList`); ตั้งค่าครั้งเดียวต้น `rqPick()` ก่อน loop → ทุก templated part กลมกลืนภาษาเดียว
  - **กัน mixing:** `rqBuildLearningQuest`/`rqBuildWorkQuest` กรอง `rqGetDomainsFromHistory(cat)` ให้เหลือเฉพาะ domain ที่ `rqDetectLang === _rqRollLang` ก่อน pick; ถ้าไม่มี → fallback `rqLoc(...)` (ภาษาที่เลือก)
  - **คงเดิม:** repeat method (~40%) ยังคืนชื่อที่ผู้ใช้พิมพ์เอง verbatim (ไม่ผ่าน rqLoc); rqMatchIndex ยัง match 2 ภาษา. rqLoc ถูกเรียกเฉพาะใน builders (ผ่าน rqPick) → stale `_rqRollLang` ระหว่างรอบไม่มีผล
  - ผ่าน node syntax check (0 errors) + sim distribution ถูกต้อง

- **[2026-06-06] Bilingual i18n — Phase 2 (Random Quest generator + คำที่ตกหล่น)** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **คำที่ตกหล่น**: `hpHeroLabel` "คะแนนรวม"→`hist.totalScore`, `hqCatDesc` 4 หมวด→`cat.desc.*`, `hqQuestName` placeholder→`hq.namePh`
  - **Random Quest generator เป็น 2 ภาษาจริง**: ย้ายเนื้อหา pool ทั้งหมดเข้า dict `rq.*` (workflow/bodypart/cardio/connection/learn.language|math|generic/learnDomains/workDomains/fallback.low|mid|high) เป็น array th/en เรียง index เดียวกัน. `SQ_DICE_GEN` เหลือแค่ `durations`/`kw`/`fallbackCat` (language-neutral); ลบ `SQ_WORK_FLOW` ทิ้ง
  - **helper ใหม่** (ข้าง generator): `rqLoc(key)`=`tList(key)` (ภาษาปัจจุบัน), `rqMatchIndex(name,key)`=คืน index ที่ name มี substring ตรงกับ th **หรือ** en → stored history ภาษาไหนก็ map กลับเป็น id เดิมได้
  - **logic ทำงานบน index แทนข้อความไทย**: `rqGetLastWorkActionForDomain`คืน index, `rqPickProgressedWorkAction`ไล่สเต็ปบน index+คืน label ภาษาปัจจุบัน, bodypart dedup ใช้ index (`rqGetPhysicalBodyPartFromName`/`rqQuestIsPhysicalCardioName`→`rqMatchIndex`), `bodyPart` เก็บเป็น index (ระวัง index 0 = chest → ใช้ `>= 0`/`Number.isInteger` ไม่ใช่ truthy)
  - **AI prompt 2 ภาษา**: `getAICoachComment`/`getQuestSuggestions` → ย้าย prompt+timeLabel เข้า dict `ai.*`, ฝั่ง EN สั่งโมเดลตอบอังกฤษ
  - **คงไว้ตั้งใจ**: `SQ_DICE_GEN.kw.language/.math` (keyword matcher, มีทั้งไทย+อังกฤษ, ไม่ display) + code comments
  - ผ่าน node syntax check (0 errors), rq.* keys ครบ, ไม่มี SQ_WORK_FLOW/fallbackPool/learningActivities หลงเหลือ

- **[2026-06-06] Bilingual i18n (ไทย/อังกฤษ)** — ทำใน `www/index.html` + `www/auth.js` ยังไม่ได้ commit/cap sync
  - **i18n engine** วางต้น `<script>` หลัก (~บรรทัด 11652): `currentLang`, `I18N={th,en}`, `t(key,vars)`, `tList(key,vars)` (สำหรับ `pick()` arrays), `applyStaticI18n(root)` (กวาด `data-i18n` / `data-i18n-html` / `data-i18n-ph` / `data-i18n-aria`), `applyLanguage(lang,{persist})`, `detectInitialLang()`. expose `window.t/tList/applyLanguage/getLang`
  - **Dictionary** เพิ่มแบบ `addI18N({th,en})` หลาย section (มี marker `/* === END I18N SECTIONS === */` ให้ append ก่อนเสมอ) — ครอบ menu/timer/report/home/gate/history/schedule/rq/onboarding/toasts(warn.*/lock.*)/alert/prompt/notifications(noti.*)/tips/install/boot/greet.* + auth.*
  - **แถบ Language** ใน `#topMenu` (สไตล์เดียวกับ Data Management) + modal `#langPanel` (copy `.dataPanel`) เลือก ไทย/English, badge `#topMenuLangState` (TH/EN) อัปเดตใน `renderTopMenuUI()`
  - **เก็บค่า** ใน `all.prefs.language` (เพิ่ม `prefs:{}` ใน `createEmptyAppData`+`normalizeAppData`) → sync cloud อัตโนมัติ. boot อ่าน pref/auto-detect แล้ว `applyLanguage()` (hook หลัง `loadState()`); re-apply ตอน `sq-user-changed`
  - **greeting กวนๆ** (`getHomeGreetingTexts`) เขียนใหม่เป็น data-driven → `tList("greet.<period>.<bucket>.prefix/.sub")` (5 ช่วงเวลา × 6 บัคเก็ตคะแนน), แปลอังกฤษให้ได้อารมณ์เดิม
  - **ยังเหลือเป็นไทย (ตั้งใจเว้นไว้)**: เนื้อหา Random Quest generator (SQ_WORK_FLOW / suggestion pools / AI domain lists / AI prompt ~บรรทัด 15560-16115) เพราะผูกกับ normalizer/dedup ที่ match Thai substring + keyword matcher arrays (ไม่ได้ display) + โค้ดคอมเมนต์. ถ้าจะทำต่อต้องแก้ normalizer ให้รองรับ 2 ภาษา
  - ผ่าน node syntax check (0 errors), 30 greet keys ครบ

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

- **[2026-06-06] Release v0.16.0 (versionCode 30)** — APK build + copy ไป Downloads
  - รวม Bilingual i18n Phase 1+2 (ไทย/อังกฤษ), Random Quest generator 2 ภาษา

- **[2026-06-05] Release v0.15.1 (versionCode 29)** — APK build + copy ไป Downloads
  - รวม cross-device fixes + history redesign ทั้งหมดข้างบน

- **[2026-06-04] Release v0.15.0 (versionCode 28)** — APK build + copy ไป Downloads
  - Gate Top Bar, AI Quest Picker, OS Notifications, History view, Delete quest modal
